import { ThemedText } from '@/components/ThemedText';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import Mapbox, { Camera, LineLayer, PointAnnotation, ShapeSource } from '@rnmapbox/maps';
import { getRouteById } from '@/utils/savedRoutesAPI';
import { BASE_URL } from '@/config';
import { requestLocationPermissions } from '@utils/permissions';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

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
  const [routeLine, setRouteLine] = useState<any>(null);

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
      if (granted) {
        setLocationGranted(true);
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const currentCoords: [number, number] = [longitude, latitude];
        setCenterCoordinate(currentCoords);

        if (!savedRouteId) return;

        const route = await getRouteById(savedRouteId as string);
        const cps = route.checkpoints || [];
        setCheckpoints(cps);

        const to = route.destination;
        if (to?.lat && to?.lng) {
          const toC: [number, number] = [to.lng, to.lat];
          setToCoords(toC);

          // Now draw the route from CURRENT location to `to`, with waypoints
          try {
            const waypoints = cps.map((cp) => [cp.lng, cp.lat]);
            const body = {
              from: currentCoords,
              to: toC,
              waypoints,
            };

            const response = await fetch(`${BASE_URL}/api/directions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            const data = await response.json();
            setRouteLine(data.geometry);
          } catch (err) {
            console.error('❌ Failed to draw route:', err);
          }
        }
      }
    })();
  }, [savedRouteId]);

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
          onPress={() => router.push('/dashboard')}
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
          onDidFinishLoadingMap={() => setMapReady(true)}
        >
          <Camera
            centerCoordinate={centerCoordinate}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {mapReady && locationGranted && (
            <Mapbox.UserLocation visible={true} showsUserHeadingIndicator={true} />
          )}

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

          {routeLine && (
            <ShapeSource id="routeLine" shape={{ type: 'Feature', geometry: routeLine }}>
              <LineLayer
                id="routeLineLayer"
                style={{
                  lineColor: '#ADCE7D',
                  lineWidth: 5,
                  lineJoin: 'round',
                  lineCap: 'round',
                }}
              />
            </ShapeSource>
          )}
        </Mapbox.MapView>

        <ETAStatusBar />
        <TripAlarmModal visible={showAlarm} onSwipeComplete={() => setShowAlarm(false)} />
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
