import { ThemedText } from '@/components/ThemedText';
import { ETAStatusBar } from '@/components/ui/ETAStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TripAlarmModal } from '@/components/ui/modals/tripAlarm';
import Mapbox, { Camera } from '@rnmapbox/maps';
import { requestLocationPermissions } from '@utils/permissions';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as BackgroundTask from 'expo-background-task';
import { Vibration } from 'react-native';

import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, TouchableOpacity, View } from 'react-native';

Mapbox.setAccessToken('your_mapbox_token_here');

const ALARM_TASK = 'alarm-background-task';

// 🛠 Notification handler to make sure alerts show up
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MapScreen() {
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const fg = await Location.getForegroundPermissionsAsync();
        const bg = await Location.getBackgroundPermissionsAsync();
        setLocationGranted(fg.status === 'granted' && bg.status === 'granted');
      }
      appState.current = nextAppState;
    });
    return () => sub.remove();
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

  // ✅ Ask notif permissions once
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted!');
      }
    })();
  }, []);

  useEffect(() => {
    const initAlarm = async () => {
      setShowAlarm(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      await sound.playAsync();

      // Force strong notification
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

      // Strong looping vibration
      Vibration.vibrate([0, 1000, 1000], true);
    };

    const timeout = setTimeout(initAlarm, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const stopAlarm = async () => {
    setShowAlarm(false);
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    Vibration.cancel();
  };

  useEffect(() => {
    const registerBackground = async () => {
      try {
        await BackgroundTask.unregisterTaskAsync(ALARM_TASK).catch(() => {});
        await BackgroundTask.registerTaskAsync(ALARM_TASK);
      } catch (err) {
        console.warn('Background task registration failed:', err);
      }
    };
    registerBackground();
  }, []);

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
          <ThemedText type="button" style={styles.cancelTripText}>Cancel Trip</ThemedText>
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
            <Mapbox.UserLocation visible showsUserHeadingIndicator />
          )}
        </Mapbox.MapView>

        <ETAStatusBar />
        <TripAlarmModal visible={showAlarm} onSwipeComplete={stopAlarm} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTopRow: {
    position: 'absolute', top: 40, left: 25,
    flexDirection: 'row', alignItems: 'center',
    paddingRight: 10, borderRadius: 999,
    backgroundColor: '#ffffff', zIndex: 99,
  },
  backCircle: { borderRadius: 999, padding: 4, flexDirection: 'row' },
  backText: { color: '#145E4D', marginLeft: 6 },
  cancelTripButton: {
    position: 'absolute', top: 40, right: 25,
    alignSelf: 'flex-end', backgroundColor: '#D9534F',
    paddingHorizontal: 10, paddingVertical: 2,
    borderRadius: 30, elevation: 5, zIndex: 100,
  },
  cancelTripText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  map: { flex: 1 },
  statusBarOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 40, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99,
  },
});