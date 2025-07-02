import { ThemedText } from '@/components/ThemedText';
import Mapbox, { Camera } from '@rnmapbox/maps';
import { getRouteById } from '@/utils/savedRoutesAPI';
import { WINDOW_HEIGHT } from '@utils/index';
import * as Location from 'expo-location';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  AppStateStatus,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

Mapbox.setAccessToken('your-mapbox-token');

const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const MAX_BOTTOM_SHEET_HEIGHT = WINDOW_HEIGHT * 0.76;
const DRAG_THRESHOLD = 50;

const MapScreen = () => {
  const { id: saved_route_id } = useLocalSearchParams();
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [checkpoints, setCheckpoints] = useState<{ lat: number; lng: number }[]>([]);
  const [alarmSound, setAlarmSound] = useState('');
  const [vibration, setVibration] = useState(false);
  const [notifEarly, setNotifEarly] = useState(0);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const animatedHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(BOTTOM_SHEET_MIN_HEIGHT);

  useEffect(() => {
    const id = animatedHeight.addListener(({ value }) => {
      currentHeight.current = value;
    });
    return () => animatedHeight.removeListener(id);
  }, []);

  const expandSheet = () => Animated.spring(animatedHeight, { toValue: MAX_BOTTOM_SHEET_HEIGHT, useNativeDriver: false }).start();
  const collapseSheet = () => Animated.spring(animatedHeight, { toValue: BOTTOM_SHEET_MIN_HEIGHT, useNativeDriver: false }).start();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderMove: (_, g) => {
        const newHeight = currentHeight.current - g.dy;
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= MAX_BOTTOM_SHEET_HEIGHT) {
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -DRAG_THRESHOLD) expandSheet();
        else if (g.dy > DRAG_THRESHOLD) collapseSheet();
        else currentHeight.current > (BOTTOM_SHEET_MIN_HEIGHT + MAX_BOTTOM_SHEET_HEIGHT) / 2 ? expandSheet() : collapseSheet();
      },
    })
  ).current;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current?.match(/inactive|background/) && nextAppState === 'active') {
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
    if (!saved_route_id) {
      console.warn('⚠️ No saved_route_id found in params');
      return;
    }

    console.log('🛰️ Saved Route ID:', saved_route_id);

    try {
      const route = await getRouteById(saved_route_id as string);
      setFromName(route.from_name);
      setToName(route.destination_name);
      setCheckpoints(route.checkpoints || []);
      setAlarmSound(route.alarm_sound);
      setVibration(route.vibration);
      setNotifEarly(route.notif_early);
      setCenterCoordinate([route.from.lng, route.from.lat]);
    } catch (err) {
      console.error('❌ Failed to fetch saved route:', err);
    }
  })();
}, [saved_route_id]);


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
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
            <Mapbox.UserLocation visible={true} showsUserHeadingIndicator={true} />
          )}
        </Mapbox.MapView>

        <Animated.View style={[styles.bottomSheet, { height: animatedHeight }]}>
          <View style={styles.draggableArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <ThemedText type="titleSmall">Saved Route</ThemedText>
            <ThemedText type="default">Review trip details before starting your journey.</ThemedText>

            <View style={{ marginTop: 20 }}>
              <View style={styles.infoBox}>
                <ThemedText type="option">FROM</ThemedText>
                <ThemedText type="defaultSemiBold">{fromName}</ThemedText>
              </View>

              {checkpoints.map((cp, idx) => (
                <View key={idx} style={styles.infoBox}>
                  <ThemedText type="option">{`CHECKPOINT ${idx + 1}`}</ThemedText>
                  <ThemedText type="default">Lat: {cp.lat}, Lng: {cp.lng}</ThemedText>
                </View>
              ))}

              <View style={styles.infoBox}>
                <ThemedText type="option">DESTINATION</ThemedText>
                <ThemedText type="defaultSemiBold">{toName}</ThemedText>
              </View>
            </View>

            {/* Alarm Settings - keep original style */}
            <ThemedText type="titleSmall" style={{ marginBottom: 12, marginTop: 20 }}>
              Alarm Settings
            </ThemedText>

            <View style={styles.settingRow}>
              <View style={styles.settingItem}>
                <ThemedText type="defaultSemiBold">Alarm Sound</ThemedText>
                <ThemedText type="default">{alarmSound || 'None'}</ThemedText>
              </View>

              <View style={styles.settingItem}>
                <ThemedText type="defaultSemiBold">Vibration</ThemedText>
                <ThemedText type="default">{vibration ? 'Enabled' : 'Disabled'}</ThemedText>
              </View>

              <View style={styles.settingItem}>
                <ThemedText type="defaultSemiBold">Notify Earlier</ThemedText>
                <ThemedText type="default">
                  {notifEarly === 300
                    ? '300 meters'
                    : notifEarly === 500
                    ? '500 meters'
                    : notifEarly === 700
                    ? '700 meters'
                    : 'None'}
                </ThemedText>
              </View>
            </View>


          </ScrollView>



          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <ThemedText type="button" style={{ color: '#104E3B' }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.useAlarmBtn} onPress={() => setShowModal(true)}>
              <ThemedText type="button" style={{ color: 'white' }}>Use Alarm</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ThemedText type="title">Start Trip?</ThemedText>
              <ThemedText type="default" style={{ marginVertical: 12 }}>Route edits won’t be allowed after this.</ThemedText>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.modalCancel}>
                  <ThemedText type="button" style={{ color: '#104E3B' }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/gps-window/main-gps')} style={styles.modalConfirm}>
                  <ThemedText type="button" style={{ color: 'white' }}>Confirm</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#a8bed2',
        shadowOpacity: 1,
        shadowRadius: 6,
        shadowOffset: { width: 2, height: 2 },
      },
    }),
  },
    infoBox: {
    backgroundColor: '#F1F5F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 90,
    justifyContent: 'space-between',
  },
  settingItem: {
    flexDirection: 'column',
  },
  draggableArea: {
    width: 132,
    height: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 100,
    height: 6,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  useAlarmBtn: {
    flex: 1,
    backgroundColor: '#104E3B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#104E3B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#104E3B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#104E3B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
});
