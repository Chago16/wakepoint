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
import { BASE_URL } from '@config';
import BottomSheetSwitcher from './bottom-sheet-switcher';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MapScreen = () => {
  const { mode: initialMode } = useLocalSearchParams();
  const [mode, setMode] = useState<string>(initialMode ?? 'create');
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
    resetTrip, // <-- here
  } = useTripPoints();

  // 🆕 Alarm state added
  const [alarmSoundIndex, setAlarmSoundIndex] = useState(0);
  const [notifyEarlierIndex, setNotifyEarlierIndex] = useState(0);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    return () => {
      resetTrip(); // new reset method
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
        setCenterCoordinate([longitude, latitude]);
      }
    })();
  }, []);

  useEffect(() => {
    if (fromCoords && toCoords) {
      console.log('✅ Detected both from and to coords, fetching route...');
      fetchSnappedRoute();
    } else {
      console.log('🟡 Missing coords:', { fromCoords, toCoords });
    }
  }, [fromCoords, toCoords, checkpoints]);

  const fetchSnappedRoute = async () => {
    if (!fromCoords || !toCoords) {
      console.warn('⚠️ fetchSnappedRoute called without from/to coords.');
      return;
    }

    const waypointCoords = checkpoints.map(cp => cp.coords);
    console.log('📦 Fetching directions with:', {
      from: fromCoords,
      to: toCoords,
      waypoints: waypointCoords,
    });

    try {
      const res = await fetch(`${BASE_URL}/api/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromCoords,
          to: toCoords,
          waypoints: waypointCoords,
        }),
      });

      const data = await res.json();

      if (!data?.geometry) {
        console.error('❌ No geometry returned in API response:', data);
        return;
      }

      setRouteGeoJSON({
        type: 'Feature',
        geometry: data.geometry,
      });

      console.log('✅ Route received and drawn!', data);
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

            console.log('Tapped coords:', coords);
            if (addressResult) console.log('Reverse address:', addressResult.address);
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
                style={{
                  lineColor: '#ADCE7D',
                  lineWidth: 5,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
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

          // ✅ These were missing
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
        />
      </View>
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
