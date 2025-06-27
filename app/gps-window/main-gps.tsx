import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, AppState, AppStateStatus } from 'react-native';
import Mapbox, { Camera } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { requestLocationPermissions } from '@utils/permissions';
import { Stack } from 'expo-router';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar'; // adjust path as needed

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

export default function MapScreen() {
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

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
        setCenterCoordinate([longitude, latitude]);
      }
    })();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.statusBarOverlay} />
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/navigation-guidance-night-v4"
          logoEnabled={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          onDidFinishLoadingMap={() => setMapReady(true)}
        >
          <Camera
            centerCoordinate={centerCoordinate}
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1000}
          />

          {mapReady && locationGranted && (
            <Mapbox.UserLocation
              visible={true}
              showsUserHeadingIndicator={true}
            />
          )}
        </Mapbox.MapView>

        {/* Bottom ETA Status Bar */}
        <ETAStatusBar />

        <TripAlarmModal
          visible={showAlarm}
          onSwipeComplete={() => setShowAlarm(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
