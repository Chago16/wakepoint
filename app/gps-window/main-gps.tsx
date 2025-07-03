import { ThemedText } from '@/components/ThemedText';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import { BASE_URL } from '@/config';
import { getRouteById } from '@/utils/savedRoutesAPI';
import Mapbox, { Camera, LineLayer, PointAnnotation, ShapeSource } from '@rnmapbox/maps';
import { requestLocationPermissions } from '@utils/permissions';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';

Mapbox.setAccessToken('YOUR_MAPBOX_TOKEN_HERE');

const PinIcon = ({ type, index }: { type: 'from' | 'to' | 'checkpoint'; index?: number }) => {
  if (type === 'checkpoint') {
    return (
      <View style={styles.checkpointPin}>
        <ThemedText style={styles.checkpointText}>{index ?? '?'}</ThemedText>
      </View>
    );
  }

  const iconName = type === 'from' ? 'location' : 'flag';
  const iconColor = type === 'from' ? '#8CC63F' : '#104E3B';

  return (
    <View style={styles.fromToPin}>
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

  const [fromName, setFromName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [routeLineFromTo, setRouteLineFromTo] = useState<any>(null);
  const [routeLineCurrentTo, setRouteLineCurrentTo] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState('');
  const [distanceLeft, setDistanceLeft] = useState('');
  const [etaTime, setEtaTime] = useState('');
  const [progress, setProgress] = useState(0);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const locationWatcher = useRef<Location.LocationSubscription | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const fg = await Location.getForegroundPermissionsAsync();
        const bg = await Location.getBackgroundPermissionsAsync();
        setLocationGranted(fg.status === 'granted' && bg.status === 'granted');
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  // Main load
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

      if (!from?.lng || !from?.lat || !to?.lng || !to?.lat) return;

      const fromC: [number, number] = [from.lng, from.lat];
      const toC: [number, number] = [to.lng, to.lat];
      const waypoints = cps.map((cp) => [cp.lng, cp.lat]);

      setFromCoords(fromC);
      setToCoords(toC);

      try {
        const [fromRes, currentRes] = await Promise.all([
          fetch(`${BASE_URL}/api/directions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromC, to: toC, waypoints }),
          }),
          fetch(`${BASE_URL}/api/directions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentCoords, to: toC, waypoints }),
          }),
        ]);

        const fromData = await fromRes.json();
        const currentData = await currentRes.json();

        setRouteLineFromTo(fromData.geometry);
        setRouteLineCurrentTo(currentData.geometry);
        setInitialDistance(currentData.distance);
        updateStatus(currentData.duration, currentData.distance);

        locationWatcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 10,
          },
          async (loc) => {
            const userCoords: [number, number] = [loc.coords.longitude, loc.coords.latitude];
            setCenterCoordinate(userCoords);

            try {
              const res = await fetch(`${BASE_URL}/api/directions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: userCoords, to: toC, waypoints }),
              });
              const data = await res.json();
              setRouteLineCurrentTo(data.geometry);
              updateStatus(data.duration, data.distance);

              if (initialDistance) {
                const raw = 1 - data.distance / initialDistance;
                setProgress(Math.min(Math.max(raw, 0), 1));
              }
            } catch (err) {
              console.error('❌ Live route update failed:', err);
            }
          }
        );
      } catch (err) {
        console.error('❌ Failed to load route directions:', err);
      }
    })();

    return () => locationWatcher.current?.remove?.();
  }, [savedRouteId]);

  const updateStatus = (durationSec: number, distanceMeters: number) => {
    const mins = Math.round(durationSec / 60);
    const km = (distanceMeters / 1000).toFixed(1);
    const eta = new Date(Date.now() + durationSec * 1000);
    const formattedETA = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeLeft(`${mins} min${mins !== 1 ? 's' : ''}`);
    setDistanceLeft(`${km} km`);
    setEtaTime(formattedETA);
  };

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

        <TouchableOpacity style={styles.cancelTripButton} onPress={() => router.push('/dashboard')}>
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
          <Camera centerCoordinate={centerCoordinate} zoomLevel={14} animationMode="flyTo" animationDuration={1000} />

          {mapReady && locationGranted && <Mapbox.UserLocation visible showsUserHeadingIndicator />}
          {fromCoords && <PointAnnotation id="from" coordinate={fromCoords}><PinIcon type="from" /></PointAnnotation>}
          {toCoords && <PointAnnotation id="to" coordinate={toCoords}><PinIcon type="to" /></PointAnnotation>}

          {checkpoints.map((cp, idx) => (
            <PointAnnotation key={`checkpoint-${idx}`} id={`checkpoint-${idx}`} coordinate={[cp.lng, cp.lat]}>
              <PinIcon type="checkpoint" index={idx + 1} />
            </PointAnnotation>
          ))}

          {routeLineFromTo && (
            <ShapeSource id="routeFromTo" shape={{ type: 'Feature', geometry: routeLineFromTo }}>
              <LineLayer id="routeFromToLayer" style={{
                lineColor: '#6C7372', lineWidth: 4, lineJoin: 'round', lineCap: 'round', lineDasharray: [2, 2]
              }} />
            </ShapeSource>
          )}

          {routeLineCurrentTo && (
            <ShapeSource id="routeCurrentTo" shape={{ type: 'Feature', geometry: routeLineCurrentTo }}>
              <LineLayer id="routeCurrentToLayer" style={{
                lineColor: '#ADCE7D', lineWidth: 4, lineJoin: 'round', lineCap: 'round'
              }} />
            </ShapeSource>
          )}
        </Mapbox.MapView>

        <ETAStatusBar fromName={fromName} destinationName={destinationName} timeLeft={timeLeft} distance={distanceLeft} eta={etaTime} progress={progress} />
        <TripAlarmModal visible={showAlarm} onSwipeComplete={() => setShowAlarm(false)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTopRow: {
    position: 'absolute', top: 40, left: 25, flexDirection: 'row', alignItems: 'center',
    paddingRight: 10, borderRadius: 999, backgroundColor: '#ffffff', zIndex: 99,
  },
  backCircle: { borderRadius: 999, padding: 4, flexDirection: 'row' },
  backText: { color: '#145E4D', marginLeft: 6 },
  cancelTripButton: {
    position: 'absolute', top: 40, right: 25,
    backgroundColor: '#D9534F', paddingHorizontal: 10, paddingVertical: 2,
    borderRadius: 30, elevation: 5, zIndex: 100,
  },
  cancelTripText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  map: { flex: 1 },
  statusBarOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 40, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99,
  },
  checkpointPin: {
    backgroundColor: '#2C7865', width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  checkpointText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  fromToPin: { backgroundColor: 'white', padding: 6, borderRadius: 20, elevation: 3 },
});
