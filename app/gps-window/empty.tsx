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

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

export default function MapScreen() {
  const { id: savedRouteId } = useLocalSearchParams();
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [checkpoints, setCheckpoints] = useState<{ lat: number; lng: number }[]>([]);
  const [routeLine, setRouteLine] = useState<any>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
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