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
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MAX_HEIGHT = WINDOW_HEIGHT * 0.65;
const MID_HEIGHT = WINDOW_HEIGHT * 0.4;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, MID_HEIGHT - MAX_HEIGHT - 0.9, 0];

const MapScreen = () => {
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const appState = useRef(AppState.currentState);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [notifyEarlierEnabled, setNotifyEarlierEnabled] = useState(false);

  const animatedValue = useRef(new Animated.Value(POSITIONS[1])).current;
  const currentPosition = useRef(1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animatedValue.extractOffset();
      },
      onPanResponderMove: (_, gesture) => {
        animatedValue.setValue(gesture.dy);
      },
      onPanResponderRelease: () => {
        animatedValue.flattenOffset();
        animatedValue.stopAnimation((newY) => {
          let closest = 0;
          let minDist = Infinity;
          POSITIONS.forEach((pos, idx) => {
            const dist = Math.abs(newY - pos);
            if (dist < minDist) {
              minDist = dist;
              closest = idx;
            }
          });
          currentPosition.current = closest;
          Animated.spring(animatedValue, {
            toValue: POSITIONS[closest],
            useNativeDriver: true,
          }).start();
        });
      },
    })
  ).current;

  const bottomSheetStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [POSITIONS[0], POSITIONS[2]],
          outputRange: [POSITIONS[0], POSITIONS[2]],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

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
                    <Mapbox.UserLocation
                      visible={true}
                      showsUserHeadingIndicator={true}
                    />
                  )}
                </Mapbox.MapView>

        <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
          <View style={styles.draggableArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <ThemedText type="titleSmall">Create Trip Alarm</ThemedText>
            <ThemedText type="default" style={{ marginBottom: 25 }}>We will wake you up. Don’t worry!</ThemedText>

            <View style={styles.checkpoint}>
              <View style={styles.checkIconCircle} />
              <View style={styles.checkpointTextBox}><ThemedText type="defaultSemiBold">Destination</ThemedText></View>
            </View>

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View style={styles.checkpointTextBox}><ThemedText type="defaultSemiBold">From</ThemedText></View>
            </View>

            <View style={styles.separator} />

            <ThemedText type="titleSmall" style={{ marginTop: 12, marginBottom: 12 }}>Alarm Settings</ThemedText>

            <View style={[styles.settingRow, { marginBottom: 8 }]}> 
              <View>
                <ThemedText type="defaultSemiBold">Alarm sound</ThemedText>
                <ThemedText type="default">Default tone</ThemedText>
              </View>
              <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: '#E0E0E0', true: '#104E3B' }} thumbColor={soundEnabled ? '#fff' : '#d3d3d3'} />
            </View>

            <View style={styles.separator} />

            <View style={[styles.settingRow, { marginTop: 8, marginBottom: 8 }]}> 
              <View>
                <ThemedText type="defaultSemiBold">Vibration</ThemedText>
                <ThemedText type="default">Silent alert</ThemedText>
              </View>
              <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} trackColor={{ false: '#E0E0E0', true: '#104E3B' }} thumbColor={vibrationEnabled ? '#fff' : '#d3d3d3'} />
            </View>

            <View style={styles.separator} />

            <View style={[styles.settingRow, { marginTop: 8, marginBottom: -20 }]}> 
              <View>
                <ThemedText type="defaultSemiBold">Notify me earlier</ThemedText>
                <ThemedText type="default">300m alert</ThemedText>
              </View>
              <Switch value={notifyEarlierEnabled} onValueChange={setNotifyEarlierEnabled} trackColor={{ false: '#E0E0E0', true: '#104E3B' }} thumbColor={notifyEarlierEnabled ? '#fff' : '#d3d3d3'} />
            </View>
          </ScrollView>
        </Animated.View>

        <View style={styles.separator} />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/(route-alarms)/choose')}>
            <ThemedText type="button" style={{ color: '#104E3B' }}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.useAlarmBtn} onPress={() => router.push('/trip-checkpoints')}>
            <ThemedText type="button" style={{ color: 'white' }}>Next</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8CC63F',
    marginTop: 8,
    marginRight: 12,
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
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#D3D3D3',
    marginVertical: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    height: MAX_HEIGHT,
    bottom: MIN_HEIGHT - MAX_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
});
