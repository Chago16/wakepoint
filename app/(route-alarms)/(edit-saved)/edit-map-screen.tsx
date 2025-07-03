import Mapbox, { Camera } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import InstructionBanner from '@/components/InstructionBanner';
import { TripMarkers } from '@/components/TripMarkers';
import { useTripPoints } from '@/hooks/useTripPoints';
import { getAddressFromCoordinates } from '@/utils/geocodingService';
import { requestLocationPermissions } from '@/utils/permissions';
import { getRouteById } from '@/utils/savedRoutesAPI';
import { BASE_URL } from '@config';
import BottomSheetSwitcher from './edit-bottom-sheet-switcher';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MapScreen = () => {
  const { mode: initialMode, id: saved_route_id } = useLocalSearchParams();
  const [mode, setMode] = useState<string>(initialMode ?? 'edit');
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const appState = useRef(AppState.currentState);
  const [activePoint, setActivePoint] = useState<'from' | 'to' | null>(null);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  const [fromPlaceName, setFromPlaceName] = useState('');
  const [toPlaceName, setToPlaceName] = useState('');

  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);

  const {
    fromCoords,
    toCoords,
    setFromCoords,
    setToCoords,
    checkpoints,
    setCheckpoints,
    resetTrip,
  } = useTripPoints();

  const [alarmSoundIndex, setAlarmSoundIndex] = useState(0);
  const [notifyEarlierIndex, setNotifyEarlierIndex] = useState(0);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

    const convertDistanceToIndex = (distance: number): number => {
    switch (distance) {
      case 300:
        return 0;
      case 500:
        return 1;
      case 700:
        return 2;
      default:
        return -1;
    }
  };

  const convertAlarmToIndex = (alarm: string): number => {
  switch (alarm) {
    case 'alarm1':
      return 0;
    case 'alarm2':
      return 1;
    case 'alarm3':
      return 2;
    default:
      return 0; // fallback
  }
};


  // 🆕 Fetch saved route if SRID is passed
  useEffect(() => {
    if (!saved_route_id) return;

    (async () => {
      try {
        const route = await getRouteById(saved_route_id as string);
        const from = route.from;
        const to = route.destination;
        const cps = route.checkpoints || [];

        setFromCoords([from.lng, from.lat]);
        setToCoords([to.lng, to.lat]);
        setCheckpoints(
          cps.map((cp: any, index: number) => ({
            id: `cp-${index}`,
            coords: [cp.lng, cp.lat],
            name: '',
            search: '',
          }))
        );

        // Fetch address names for each checkpoint if missing
        const resolvedCheckpoints = await Promise.all(
          cps.map(async (cp: any, index: number) => {
            const coords: [number, number] = [cp.lng, cp.lat];
            const addressResult = await getAddressFromCoordinates(cp.lat, cp.lng);
            const resolvedName = addressResult?.address ?? '';

            return {
              id: `cp-${index}`,
              coords,
              name: resolvedName,
              search: resolvedName,
            };
          })
        );

        setCheckpoints(resolvedCheckpoints);


        setFromPlaceName(route.from_name);
        setToPlaceName(route.destination_name);

        setAlarmSoundIndex(convertAlarmToIndex(route.alarm_sound));
        setNotifyEarlierIndex(convertDistanceToIndex(route.notif_early));
        setVibrationEnabled(!!route.vibration);

        setCenterCoordinate([from.lng, from.lat]);
      } catch (err) {
        console.error('❌ Failed to load saved route:', err);
      }
    })();
  }, [saved_route_id]);

  useEffect(() => {
    return () => {
      resetTrip();
      setFromPlaceName('');
      setToPlaceName('');
      setActivePoint(null);
      setRouteGeoJSON(null);
    };
  }, []);

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
        // setCenterCoordinate([longitude, latitude]);
      }
    })();
  }, []);

  useEffect(() => {
    if (fromCoords && toCoords) {
      fetchSnappedRoute();
    }
  }, [fromCoords, toCoords, checkpoints]);

  const fetchSnappedRoute = async () => {
    if (!fromCoords || !toCoords) return;

    const waypointCoords = checkpoints.map(cp => cp.coords);

    try {
      const res = await fetch(`${BASE_URL}/api/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromCoords, to: toCoords, waypoints: waypointCoords }),
      });

      const data = await res.json();

      if (data?.geometry) {
        setRouteGeoJSON({ type: 'Feature', geometry: data.geometry });
      }
    } catch (err) {
      console.error('🔥 Error fetching route:', err);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {mode !== 'alarm' && <InstructionBanner />}
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/navigation-guidance-night-v4"
          logoEnabled={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          onDidFinishLoadingMap={() => setMapReady(true)}
          onPress={async (e) => {
            const coords = e.geometry.coordinates as [number, number];
            const [lng, lat] = coords;
            const addressResult = await getAddressFromCoordinates(lat, lng);

            if (activePoint === 'from') {
              setFromCoords(coords);
              if (addressResult) setFromPlaceName(addressResult.address);
            } else if (activePoint === 'to') {
              setToCoords(coords);
              if (addressResult) setToPlaceName(addressResult.address);
            } else if (activeCheckpointId) {
              const updated = checkpoints.map((cp) =>
                cp.id === activeCheckpointId
                  ? {
                      ...cp,
                      coords,
                      search: addressResult?.address ?? '',
                      name: addressResult?.address ?? '',
                    }
                  : cp
              );
              setCheckpoints(updated);
            }
          }}
        >
          <Camera
            centerCoordinate={centerCoordinate}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {routeGeoJSON && (
            <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
              <Mapbox.LineLayer
                id="routeLine"
                style={{ lineColor: '#ADCE7D', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }}
              />
            </Mapbox.ShapeSource>
          )}

          <TripMarkers fromCoords={fromCoords} toCoords={toCoords} checkpoints={checkpoints} />

          {mapReady && locationGranted && (
            <Mapbox.UserLocation visible={true} showsUserHeadingIndicator={true} />
          )}
        </Mapbox.MapView>

        <BottomSheetSwitcher
          mode={mode}
          setMode={setMode}
          fromCoords={fromCoords}
          toCoords={toCoords}
          setFromCoords={setFromCoords}
          setToCoords={setToCoords}
          activePoint={activePoint}
          setActivePoint={setActivePoint}
          fromPlaceName={fromPlaceName}
          setFromPlaceName={setFromPlaceName}
          toPlaceName={toPlaceName}
          setToPlaceName={setToPlaceName}
          checkpoints={checkpoints}
          setCheckpoints={setCheckpoints}
          activeCheckpointId={activeCheckpointId}
          setActiveCheckpointId={setActiveCheckpointId}
          alarmSoundIndex={alarmSoundIndex}
          setAlarmSoundIndex={setAlarmSoundIndex}
          notifyEarlierIndex={notifyEarlierIndex}
          setNotifyEarlierIndex={setNotifyEarlierIndex}
          vibrationEnabled={vibrationEnabled}
          setVibrationEnabled={setVibrationEnabled}
          savedRouteId={saved_route_id as string}
        />
      </View>
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
