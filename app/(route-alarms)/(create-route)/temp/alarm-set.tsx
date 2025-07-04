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
    Image,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MAX_HEIGHT = WINDOW_HEIGHT * 0.55;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.55;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0]; // only two states

const MapScreen = () => {
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const appState = useRef(AppState.currentState);

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
          const closest = POSITIONS.reduce((prev, curr) =>
            Math.abs(curr - newY) < Math.abs(prev - newY) ? curr : prev
          );
          currentPosition.current = POSITIONS.indexOf(closest);
          Animated.spring(animatedValue, {
            toValue: closest,
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
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <Image
              source={require('@/assets/images/alarm-set-icon.png')}
              style={{ width: 180, height: 180, alignSelf: 'center' }}
              resizeMode="contain"
            />
            <ThemedText type="titleSmall" style={{ color: '#145E4D', textAlign: 'center' }}>
              Great Job! Your alarm is set.
            </ThemedText>
            <ThemedText type="default" style={{ marginBottom: 25, textAlign: 'center' }}>
              Your trip is approximately 3 hours
            </ThemedText>
          </ScrollView>
        </Animated.View>

        <View style={styles.buttonCol}>
          <TouchableOpacity style={styles.useBtn} onPress={() => router.push('/gps-window/main-gps')}>
            <ThemedText type="button" style={{ color: 'white' }}>Use the Alarm</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/dashboard')}>
            <ThemedText type="button" style={{ color: '#104E3B' }}>Save for Later</ThemedText>
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
  separator: {
    height: 1,
    backgroundColor: '#D3D3D3',
  },
  buttonCol: {
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
    backgroundColor: 'white',
    gap: 10,
    zIndex: 999, // ensures it's on top
  },
  useBtn: {
    backgroundColor: '#104E3B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveBtn: {
    borderWidth: 2,
    borderColor: '#104E3B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
