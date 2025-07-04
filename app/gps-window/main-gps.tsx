// MainGPS.tsx
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

import Mapbox, { Camera, LineLayer, PointAnnotation, ShapeSource } from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { RouteDeviationBottomSheet } from '@/components/ui/bottomSheets/routeDeviationBottomSheet';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

import { requestLocationPermissions } from '@/utils/permissions';
import { getUserId } from '@/utils/session';
import { getRouteById } from '@/utils/savedRoutesAPI';
import { saveTripHistory } from '@/utils/tripHistory';

import { BASE_URL, MAPBOX_TOKEN } from '@/config';

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

Mapbox.setAccessToken(MAPBOX_TOKEN);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PinIcon = ({ type, index }: { type: 'from' | 'to' | 'checkpoint'; index?: number }) => {
  if (type === 'checkpoint') {
    return (
      <View style={{
        backgroundColor: '#2C7865',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
      }}>
        <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{index ?? '?'}</ThemedText>
      </View>
    );
  }

const iconName = type === 'from' ? 'location' : 'flag';
const iconColor = type === 'from' ? '#8CC63F' : '#104E3B';


return (
    <View style={{
      backgroundColor: 'white',
      padding: 6,
      borderRadius: 20,
      elevation: 3,
    }}>
      <IconSymbol name={iconName} color={iconColor} size={20} />
    </View>
  );
};

export default function MainGPS() {
  const { id: savedRouteId } = useLocalSearchParams();
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [checkpoints, setCheckpoints] = useState<{ lat: number; lng: number }[]>([]);
  const [routeLineFromTo, setRouteLineFromTo] = useState<any>(null);
  const [routeLineCurrentTo, setRouteLineCurrentTo] = useState<any>(null);
  const [fromName, setFromName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [distanceLeft, setDistanceLeft] = useState('');
  const [etaTime, setEtaTime] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [alarmSound, setAlarmSound] = useState('alarm');
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [notifEarlyMeters, setNotifEarlyMeters] = useState(300); // default to 300m

  const initialDistanceRef = useRef<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const elapsedTimeRef = useRef(0); // stores elapsed time in seconds
  const intervalRef = useRef<number | null>(null);
  const alarmTriggeredRef = useRef(false); // Add this near other refs
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const getElapsedSeconds = () => {
            return elapsedTimeRef.current;
          };

  const stopElapsedTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

    // 👇 Place it here near your other utility functions or constants
  const generateHistoryId = () => {
    return `HIST_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  };


  const [routeBufferGeoJSON, setRouteBufferGeoJSON] = useState<any>(null);
  const [showDeviationSheet, setShowDeviationSheet] = useState(false);
  const deviatedRef = useRef(false);
  const wasInsideRef = useRef(true);


  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const fg = await Location.getForegroundPermissionsAsync();
        const bg = await Location.getBackgroundPermissionsAsync();
        const granted = fg.status === 'granted' && bg.status === 'granted';
        setLocationGranted(granted);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermissions();
      if (!granted) return;

      setLocationGranted(true);
      const location = await Location.getCurrentPositionAsync({});
      const currentCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setCenterCoordinate(currentCoords);

      if (!savedRouteId) return;

      const route = await getRouteById(savedRouteId as string);
      const cps = route.checkpoints || [];
      const from = route.from;
      const to = route.destination;

      setCheckpoints(cps);
      setFromName(route.from_name || '');
      setDestinationName(route.destination_name || '');

      setAlarmSound(route.alarm_sound || 'alarm');
      setVibrationEnabled(route.vibration ?? false);
      setNotifEarlyMeters(route.notif_early || 300);


      if (from?.lng && from?.lat) {
        setFromCoords([from.lng, from.lat]);
      }

      if (to?.lng && to?.lat) {
        const toC: [number, number] = [to.lng, to.lat];
        setToCoords(toC);

        const waypoints = cps.map((cp) => [cp.lng, cp.lat]);

        if (from?.lng && from?.lat) {
          const fromBody = { from: [from.lng, from.lat], to: toC, waypoints };
          try {
            const res = await fetch(`${BASE_URL}/api/directions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fromBody),
            });
            const data = await res.json();
            setRouteLineFromTo(data.geometry);
            setIsLoading(false);
            if (data.geometry?.coordinates) {
              const line = turf.lineString(data.geometry.coordinates); // no coords variable needed
              const buffer = turf.buffer(line, 0.05, { units: 'kilometers' }); // 50 meters
              setRouteBufferGeoJSON(buffer);
              console.log('📍 FROM → TO route coords:', data.geometry.coordinates);
              if (buffer?.geometry?.coordinates?.[0]) {
                console.log('🟧 Buffer start:', buffer.geometry.coordinates[0][0]);
                console.log('🟧 Buffer end:', buffer.geometry.coordinates[0].slice(-1)[0]);
              }

            }
          } catch (err) {
            console.error('❌ Route from FROM → TO failed:', err);
          }
        }

        // 🚫 No waypoints here
        const currentBody = { from: currentCoords, to: toC };
        try {
          const res = await fetch(`${BASE_URL}/api/directions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentBody),
          });
          const data = await res.json();
          setRouteLineCurrentTo(data.geometry);
          if (initialDistanceRef.current === null) {
            initialDistanceRef.current = data.distance;
          }
          updateStatus(data.duration, data.distance);
          setIsLoading(false);
        } catch (err) {
          console.error('❌ Route from CURRENT → TO failed:', err);
        }
      }
    })();
  }, [savedRouteId]);

  useEffect(() => {
    if (locationGranted && toCoords) {
      intervalRef.current = setInterval(() => {
        elapsedTimeRef.current += 1;
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [locationGranted, toCoords]);


  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      const granted = true;
      if (!granted || !toCoords || !routeBufferGeoJSON) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 15,
        },
        async (location) => {
          const newCoords: [number, number] = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          setCenterCoordinate(newCoords);

          // ✅ Geofencing using Turf.js (300m radius)
          try {
            const fromPoint = turf.point(newCoords);
            const toPoint = turf.point(toCoords);
            const distanceKm = turf.distance(fromPoint, toPoint); // in kilometers

            if (distanceKm < notifEarlyMeters / 1000 && !alarmTriggeredRef.current) {
              alarmTriggeredRef.current = true;
              console.log('⏱️ Alarm Triggered:', alarmTriggeredRef);
              console.log("🎯 Destination reached!");
              initAlarm();
              stopElapsedTimer();
              console.log('⏱️ Elapsed Seconds:', getElapsedSeconds());

              // you could also trigger something like setShowAlarm(true) here
            }
          } catch (err) {
            console.error('❌ Turf distance error:', err);
          }
              // Check for route deviation
              if (routeBufferGeoJSON) { //
                const point = turf.point(newCoords);
                const isInside = turf.booleanPointInPolygon(point, routeBufferGeoJSON);

                console.log('[📍 Deviation Check]', {
                  current: newCoords,
                  insideBuffer: isInside,
                  alreadyDeviated: deviatedRef.current,
                });

                if (!isInside && wasInsideRef.current) {
                  console.warn('🚨 User has deviated from route!');
                  wasInsideRef.current = false;
                  setShowDeviationSheet(true);
                  Vibration.vibrate(2000);
                }

                if (isInside && !wasInsideRef.current) {
                  console.log('✅ User re-entered the route.');
                  wasInsideRef.current = true;
                  setShowDeviationSheet(false);
                }
              }


          // 🚫 No waypoints here
          const currentBody = {
            from: newCoords,
            to: toCoords,
          };

          try {
            const res = await fetch(`${BASE_URL}/api/directions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(currentBody),
            });
            const data = await res.json();
            setRouteLineCurrentTo(data.geometry);

            if (initialDistanceRef.current !== null && data.distance) {
              const distanceInverted = initialDistanceRef.current - data.distance;
              const rawProgress = distanceInverted / initialDistanceRef.current;
              setProgress(Math.min(Math.max(rawProgress, 0), 1));
              updateStatus(data.duration, data.distance);
            }
          } catch (err) {
            console.error('❌ Live route update failed:', err);
          }
        }
      ); locationSubscriptionRef.current = subscription;
    };

        startWatching();
        return () => {
          if (subscription) subscription.remove();
        };
      }, [toCoords, routeBufferGeoJSON]);

      useFocusEffect(
        useCallback(() => {
          // 🔛 Screen focused — do nothing here

          return () => {
            // 🔻 Screen unfocused — clean up here

            console.log('🧹 MainGPS screen cleanup');

            if (locationSubscriptionRef.current) {
              locationSubscriptionRef.current.remove();
              locationSubscriptionRef.current = null;
              console.log('📍 watchPositionAsync stopped');
            }

            // Stop timer
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            stopElapsedTimer();
            if (soundRef.current) {
              soundRef.current.stopAsync();
              soundRef.current.unloadAsync();
              soundRef.current = null;
            }
            Vibration.cancel();
          };
        }, [])
      );

      const getAlarmSoundFile = (name: string) => {
      switch (name) {
        case 'alarm1':
          return require('@/assets/sounds/alarm1.mp3');
        case 'alarm2':
          return require('@/assets/sounds/alarm2.mp3');
        case 'alarm3':
          return require('@/assets/sounds/alarm3.mp3');
        default:
          return require('@/assets/sounds/alarm.mp3');
      }
    };

    const initAlarm = async () => {
    setShowAlarm(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
      });

      const soundFile = getAlarmSoundFile(alarmSound);

      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        isLooping: true,
      });

      soundRef.current = sound;
      await sound.playAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trip Alarm',
          body: 'You have reached your destination!',
          sound: true,
          vibrate: [0, 1000, 1000],
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      if (vibrationEnabled) {
        Vibration.vibrate([0, 1000, 1000], true);
      }
    };

    const updateStatus = (durationSec: number, distanceMeters: number) => {
    const mins = Math.round(durationSec / 60);
    const km = (distanceMeters / 1000).toFixed(1);
    const eta = new Date(Date.now() + durationSec * 1000);
    const formattedETA = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeLeft(`${mins} min${mins !== 1 ? 's' : ''}`);
    setDistanceLeft(`${km} km`);
    setEtaTime(formattedETA);
  };

  const stopAlarm = async () => {
          alarmTriggeredRef.current = true;
          setShowAlarm(false);

          const userId = await getUserId();

          const success = await saveTripHistory({
              user_id: userId ?? 'unknown',
              history_id: generateHistoryId(),
              from: { lat: fromCoords?.[1] ?? 0, lng: fromCoords?.[0] ?? 0 },
              from_name: fromName,
              destination: { lat: toCoords?.[1] ?? 0, lng: toCoords?.[0] ?? 0 },
              destination_name: destinationName,
              checkpoints,
              date_start: new Date(Date.now() - getElapsedSeconds() * 1000),
              duration: getElapsedSeconds(),
            });

          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
          Vibration.cancel();
          router.push('/(home)/dashboard');
        };

  if (isLoading) return <LoadingScreen />;
      
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.backCircle}>
            <IconSymbol name="arrow.left.circle" size={20} color="#145E4D" />
            <ThemedText type="defaultSemiBold" style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelTripButton}
          onPress={async () => {
              stopElapsedTimer();
              const userId = await getUserId();

              const success = await saveTripHistory({
              user_id: userId ?? 'unknown',
              history_id: generateHistoryId(),
              from: { lat: fromCoords?.[1] ?? 0, lng: fromCoords?.[0] ?? 0 },
              from_name: fromName,
              destination: { lat: toCoords?.[1] ?? 0, lng: toCoords?.[0] ?? 0 },
              destination_name: destinationName,
              checkpoints,
              date_start: new Date(Date.now() - getElapsedSeconds() * 1000),
              duration: getElapsedSeconds(),
            });

              console.log('⏱️ Trip ended early, elapsed seconds:', getElapsedSeconds());
              router.push('/dashboard');
            }}

        >
          <ThemedText type="button" style={styles.cancelTripText}>End Trip Early</ThemedText>
        </TouchableOpacity>

        <View style={styles.statusBarOverlay} />
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/navigation-guidance-night-v4"
          logoEnabled={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          attributionEnabled={false}
          onDidFinishLoadingMap={() => {
            console.log("🗺️ Map is ready!");
            setMapReady(true);
          }}

          
        >
          <Camera
            centerCoordinate={centerCoordinate}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1000}
          />

        
          <Mapbox.UserLocation visible={true} showsUserHeadingIndicator={true} />
          

          {fromCoords && (
            <PointAnnotation id="from" coordinate={fromCoords}>
              <PinIcon type="from" />
            </PointAnnotation>
          )}

          {toCoords && (
            <PointAnnotation id="to" coordinate={toCoords}>
              <PinIcon type="to" />
            </PointAnnotation>
          )}

          {checkpoints.map((cp, idx) => (
            <PointAnnotation
              key={`checkpoint-${idx}`}
              id={`checkpoint-${idx}`}
              coordinate={[cp.lng, cp.lat]}
            >
              <PinIcon type="checkpoint" index={idx + 1} />
            </PointAnnotation>
          ))}

          {routeLineFromTo && (
            <ShapeSource id="routeFromTo" shape={{ type: 'Feature', geometry: routeLineFromTo, properties:{}  }}>
              <LineLayer
                id="routeFromToLayer"
                style={{
                  lineColor: '#6C7372',
                  lineWidth: 4,
                  lineJoin: 'round',
                  lineCap: 'round',
                  lineDasharray: [2, 2],
                }}
              />
            </ShapeSource>
          )}

          {routeLineCurrentTo && (
            <ShapeSource id="routeCurrentTo" shape={{ type: 'Feature', geometry: routeLineCurrentTo, properties:{} }}>
              <LineLayer
                id="routeCurrentToLayer"
                style={{
                  lineColor: '#ADCE7D',
                  lineJoin: 'round',
                  lineWidth: 4,
                  lineCap: 'round',
                }}
              />
            </ShapeSource>
          )}
        </Mapbox.MapView>
        

        <ETAStatusBar
          fromName={fromName}
          destinationName={destinationName}
          timeLeft={timeLeft}
          distance={distanceLeft}
          eta={etaTime}
          progress={progress}
        />

        <TripAlarmModal visible={showAlarm} onSwipeComplete={stopAlarm} />

        <RouteDeviationBottomSheet visible={showDeviationSheet} onClose={() => setShowDeviationSheet(false)}/>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTopRow: {
    position: 'absolute',
    top: 40,
    left: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    zIndex: 99,
  },
  backCircle: {
    borderRadius: 999,
    padding: 4,
    flexDirection: 'row',
  },
  backText: {
    color: '#145E4D',
    marginLeft: 6,
  },
  cancelTripButton: {
    position: 'absolute',
    top: 40,
    right: 25,
    backgroundColor: '#D9534F',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 30,
    elevation: 5,
    zIndex: 100,
  },
  cancelTripText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
});
