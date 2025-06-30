import { ThemedText } from '@/components/ThemedText';
import Mapbox, { Camera } from '@rnmapbox/maps';
import { WINDOW_HEIGHT } from '@utils/index';
import { requestLocationPermissions } from '@utils/permissions';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
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

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const MAX_BOTTOM_SHEET_HEIGHT = WINDOW_HEIGHT * 0.76;
const DRAG_THRESHOLD = 50;

const MapScreen = () => {
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const animatedHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(BOTTOM_SHEET_MIN_HEIGHT);

  useEffect(() => {
    const id = animatedHeight.addListener(({ value }) => {
      currentHeight.current = value;
    });
    return () => animatedHeight.removeListener(id);
  }, []);

  const expandSheet = () => {
    Animated.spring(animatedHeight, {
      toValue: MAX_BOTTOM_SHEET_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const collapseSheet = () => {
    Animated.spring(animatedHeight, {
      toValue: BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (e, gesture) => {
        const newHeight = currentHeight.current - gesture.dy;
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= MAX_BOTTOM_SHEET_HEIGHT) {
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dy < -DRAG_THRESHOLD) {
          expandSheet();
        } else if (gesture.dy > DRAG_THRESHOLD) {
          collapseSheet();
        } else {
          currentHeight.current > (BOTTOM_SHEET_MIN_HEIGHT + MAX_BOTTOM_SHEET_HEIGHT) / 2
            ? expandSheet()
            : collapseSheet();
        }
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
      <Stack.Screen options={{ headerShown: false }} />
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
            <Mapbox.UserLocation visible={true} showsUserHeadingIndicator={true} />
          )}
        </Mapbox.MapView>

        <Animated.View style={[styles.bottomSheet, { height: animatedHeight }]}>
          <View style={styles.draggableArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[styles.sheetContent, { flexGrow: 1 }]} // Add flexGrow here
              showsVerticalScrollIndicator={false}
            >


              <ThemedText type="titleSmall" style={{ marginBottom: 4 }}>
                Saved Route
              </ThemedText>
              <ThemedText type="default" style={{ marginBottom: 16 }}>
                Review trip details before starting your journey.
              </ThemedText>

              <View style={{ position: 'relative', marginBottom: 16 }}>
                {/* Vertical timeline line */}
                <View style={styles.timelineLine} />

                {/* Origin */}
                <View style={styles.checkpoint}>
                  <View style={styles.checkIconCircle} />
                  <View style={styles.checkpointTextBox}>
                    <ThemedText type="option">
                      FROM
                    </ThemedText>
                    <ThemedText type="defaultSemiBold">
                      Sonoma Residences, Sta. Cruz, Sta. Maria, Bulacan
                    </ThemedText>
                  </View>
                </View>

                {/* Checkpoints */}
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.checkpoints}>
                    <View style={styles.line} />
                    <View style={styles.checkpointDot} />
                    <View style={styles.checkpointDetail}>
                      <ThemedText type="option">{`CHECKPOINT ${i}`}</ThemedText>
                      <ThemedText type="default">{`Address of checkpoint ${i} here`}</ThemedText>
                    </View>
                  </View>
                ))}

                {/* Destination */}
                <View style={styles.checkpoint}>
                  <View style={styles.finalPin} />
                  <View style={styles.checkpointTextBox}>
                    <ThemedText type="option">
                      DESTINATION
                    </ThemedText>
                    <ThemedText type="defaultSemiBold">
                      Anonas Street, Sta. Mesa, Manila
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.separator} />

              <ThemedText type="titleSmall" style={{ marginBottom: 12, marginTop: 20 }}>
                Alarm Settings
              </ThemedText>

              <View style={styles.settingRow}>
                {[
                  { label: 'Alarm Sound', value: true },
                  { label: 'Vibration', value: true },
                  { label: 'Notify Earlier', value: false },
                ].map((item, idx) => {
                  const isEnabled = item.value;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.settingItem
                      ]}
                    >
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ color: isEnabled ? 'black' : '#D4D4D4' }}
                      >
                        {item.label}
                      </ThemedText>
                      <ThemedText
                        type="default"
                        style={{ color: isEnabled ? 'black' : '#D4D4D4' }}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        <View style={styles.separator} />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <ThemedText type="button" style={{ color: '#104E3B' }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.useAlarmBtn}
            onPress={() => setShowModal(true)}
          >
            <ThemedText type="button" style={{ color: 'white' }}>
              Use Alarm
            </ThemedText>
          </TouchableOpacity>
        </View>
        {showModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ThemedText type="title" style={{ fontSize: 20, textAlign: 'center' }}>
                Start Trip?
              </ThemedText>
              <ThemedText type="default" style={{ marginTop: 8, marginBottom: 24, textAlign: 'center' }}>
                Route edits won’t be allowed after this.
              </ThemedText>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.modalCancel}>
                  <ThemedText type="button" style={{ color: '#104E3B' }}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    router.push('/gps-window/main-gps');
                  }}
                  style={styles.modalConfirm}
                >
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
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
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
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderRadius:20,
  },
  checkpoints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 20,
  },
  checkIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4.5,
    borderColor: '#8CC63F',
    marginTop: 8,
    marginRight: 12,
  },
  verticalLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#8CC63F',
    marginRight: 20,
    marginLeft: 7,
    position: 'absolute',
    top: 16,
    left: 7,
    zIndex: -1,
  },
  checkpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2C7865',
    marginRight: 12,
    marginTop: 4,
  },
  finalPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#104E3B',
    marginTop: 8,
    marginRight: 12,
  },
  checkpointTextBox: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  checkpointDetail: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#D3D3D3',
    marginVertical: 0,
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
  togglePlaceholder: {
    width: 45,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
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
  timelineLine: {
  position: 'absolute',
  left: 7.3,
  top:20,
  bottom: 55,
  width: 2,
  backgroundColor: '#8CC63F',
  zIndex: -1,
  },
  line: {
    position: 'absolute',
    top: 9.8,          
    left: 9,         
    width: 11,        
    height: 2,        
    backgroundColor: '#8CC63F',
    zIndex: -1,
  },
});
