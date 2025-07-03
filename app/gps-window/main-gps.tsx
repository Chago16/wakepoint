import { ThemedText } from '@/components/ThemedText';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import Mapbox, { Camera } from '@rnmapbox/maps';
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

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    console.log('📦 Received savedRouteId:', savedRouteId);
  }, [savedRouteId]);

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
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.backCircle}>
            <IconSymbol name="arrow.left.circle" size={20} color="#145E4D" />
            <ThemedText type="defaultSemiBold" style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelTripButton}
          onPress={() => {
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
    flexDirection: 'row'
  },
  backText: {
    color: '#145E4D',
    marginLeft: 6,
  },
  cancelTripButton: {
    position: 'absolute',
    top: 40,
    right: 25,
    alignSelf: 'flex-end',
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
