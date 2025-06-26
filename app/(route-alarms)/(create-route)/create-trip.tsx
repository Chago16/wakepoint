import { ThemedText } from '@/components/ThemedText';
import Mapbox, { Camera } from '@rnmapbox/maps';
import { WINDOW_HEIGHT } from '@utils/index'; // 👈 make sure this path is correct or define WINDOW_HEIGHT directly
import { requestLocationPermissions } from '@utils/permissions';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, AppStateStatus, PanResponder, Platform, ScrollView, StyleSheet, View } from 'react-native';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const BOTTOM_SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.65;
const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.12;
const MAX_UPWARD_TRANSLATE_Y = BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;
const MAX_DOWNWARD_TRANSLATE_Y = 0;
const DRAG_THRESHOLD = 50;

const MapScreen = () => {
  const [sheetHeight, setSheetHeight] = useState(BOTTOM_SHEET_MAX_HEIGHT);  
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]); // Manila
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animatedValue.setOffset(lastGestureDy.current);
      },
      onPanResponderMove: (e, gesture) => {
        animatedValue.setValue(gesture.dy);
      },
      onPanResponderRelease: (e, gesture) => {
        animatedValue.flattenOffset();
        lastGestureDy.current += gesture.dy;

        if (gesture.dy > 0) {
          gesture.dy <= DRAG_THRESHOLD ? springAnimation('up') : springAnimation('down');
        } else {
          gesture.dy >= -DRAG_THRESHOLD ? springAnimation('down') : springAnimation('up');
        }
      },
    })
  ).current;

  const springAnimation = (direction: 'up' | 'down') => {
    lastGestureDy.current = direction === 'down' ? MAX_DOWNWARD_TRANSLATE_Y : MAX_UPWARD_TRANSLATE_Y;
    Animated.spring(animatedValue, {
      toValue: lastGestureDy.current,
      useNativeDriver: true,
    }).start();
  };

  const bottomSheetStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          outputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

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
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={true}
        onDidFinishLoadingMap={() => setMapReady(true)}
      >
        <Camera
          centerCoordinate={centerCoordinate}
          zoomLevel={14}
          animationMode="flyTo"
          animationDuration={1000}
        />
        {mapReady && locationGranted && (
          <Mapbox.UserLocation visible={true} />
        )}
      </Mapbox.MapView>

      {/* 🔽 Draggable Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.sheetContent, { padding: 20, marginHorizontal: 20, }]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="titleSmall" style={{ marginBottom: 0 }}>
            Create Trip Alarm
          </ThemedText>
          <ThemedText type="default" style={{ marginBottom: 25 }}>
            We will wake you up. Don’t worry!
          </ThemedText>

          {/* Checkpoint 0 */}
          <View style={styles.checkpoint}>
            <View style={styles.checkIconCircle} />
            <View style={styles.checkpointTextBox}>
              <ThemedText type="defaultSemiBold">Destination</ThemedText>
            </View>
          </View>

          {/* Final Destination */}
          <View style={styles.checkpoint}>
            <View style={styles.finalPin} />
            <View style={styles.checkpointTextBox}>
              <ThemedText type="defaultSemiBold">From</ThemedText>
            </View>
          </View>

          <View style={styles.separator} />

          <ThemedText type="titleSmall" style={{ marginTop: 12, marginBottom: 12 }}>
            Alarm Settings
          </ThemedText>

          {/* Alarm Sound */}
          <View style={[styles.settingRow, { marginBottom: 16 }]}>
            <View>
              <ThemedText type="defaultSemiBold">Alarm sound</ThemedText>
              <ThemedText type="default">Wakiki ft. Tierra | Essence</ThemedText>
            </View>
            <View style={styles.togglePlaceholder} />
          </View>

          {/* Vibration */}
          <View style={[styles.settingRow, { marginBottom: 16 }]}>
            <View>
              <ThemedText type="defaultSemiBold">Vibration</ThemedText>
              <ThemedText type="default">None</ThemedText>
            </View>
            <View style={styles.togglePlaceholder} />
          </View>

          {/* Notify earlier */}
          <View style={[styles.settingRow, { marginBottom: -20 }]}>
            <View>
              <ThemedText type="defaultSemiBold">Notify me earlier</ThemedText>
              <ThemedText type="default">None</ThemedText>
            </View>
            <View style={styles.togglePlaceholder} />
          </View>
        </ScrollView>

        {/* Sticky Buttons */}
        <View style={styles.separator} />
        <View style={styles.buttonRow}>
          <View style={styles.useAlarmBtn}>
            <ThemedText type="button" style={{ color: 'white' }}>
              Next
            </ThemedText>
          </View>
          <View style={styles.cancelBtn}>
            <ThemedText type="button" style={{ color: '#104E3B' }}>
              Cancel
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </View>
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
togglePlaceholder: {
    width: 45,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    },
    buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 40,
    },
    useAlarmBtn: {
    flex: 1,
    backgroundColor: '#104E3B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    },
    cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#104E3B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
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
    height: BOTTOM_SHEET_MAX_HEIGHT,
    bottom: BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
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
