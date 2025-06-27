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
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

Mapbox.setAccessToken(
  'pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw'
);

const MAX_HEIGHT = WINDOW_HEIGHT * 0.65;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0]; // [down, up]

const MapScreen = () => {
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const appState = useRef(AppState.currentState);

  const [isSheetUp, setIsSheetUp] = useState(true); // now starts up
  const animatedValue = useRef(new Animated.Value(POSITIONS[1])).current; // start up
  const currentPosition = useRef(1);

  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => {
      const up = Math.abs(value - POSITIONS[1]) < Math.abs(value - POSITIONS[0]);
      setIsSheetUp(up);
    });
    return () => animatedValue.removeListener(id);
  }, []);

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
          setIsSheetUp(closest === 1);
        });
      },
    })
  ).current;

  const bottomSheetStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [POSITIONS[0], POSITIONS[1]],
          outputRange: [POSITIONS[0], POSITIONS[1]],
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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="titleSmall">Choose Trip Checkpoints</ThemedText>
            <ThemedText type="default" style={{ marginBottom: 25 }}>
              Select checkpoints to customize your route.
            </ThemedText>

            <View style={styles.checkpoint}>
              <View style={styles.checkIconCircle} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="defaultSemiBold">Destination</ThemedText>
              </View>
            </View>

            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.checkpoint}>
                <View style={styles.verticalLine} />
                <View style={styles.checkpointDot} />
                <View>
                  <ThemedText type="defaultSemiBold">{`Checkpoint - ${i} Name`}</ThemedText>
                  <ThemedText type="default">{`Address of checkpoint ${i} here`}</ThemedText>
                </View>
              </View>
            ))}

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="defaultSemiBold">From</ThemedText>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        <View style={styles.separator} />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/create-trip')}>
            <ThemedText type="button" style={{ color: '#104E3B' }}>
              Back
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.useAlarmBtn}
            onPress={() => {
              if (!isSheetUp) {
                router.push('/alarm-set');
              } else {
                currentPosition.current = 1;
                Animated.spring(animatedValue, {
                  toValue: POSITIONS[0],
                  useNativeDriver: true,
                }).start();
                setIsSheetUp(true);
              }
            }}
          >
            <ThemedText type="button" style={{ color: 'white' }}>
              {isSheetUp ? 'Next' : 'Create Alarm'}
            </ThemedText>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
    backgroundColor: 'white',
  },
  useAlarmBtn: {
    flex: 2,
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
    elevation: 3,
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
