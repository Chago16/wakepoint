import { ThemedText } from '@/components/ThemedText';
import { WINDOW_HEIGHT } from '@/utils/index';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_HEIGHT = WINDOW_HEIGHT * 0.55;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.55;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0]; // Only two states

const AlarmSetSheet = () => {
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

  return (
    <>
      <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
        <View style={styles.draggableArea} {...panResponder.panHandlers} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('@/assets/images/alarm-set-icon.png')}
            style={{ width: 180, height: 180, alignSelf: 'center' }}
            resizeMode="contain"
          />
          <ThemedText type="titleSmall" style={{ color: '#145E4D', textAlign: 'center' }}>
            Your alarm has been saved.
          </ThemedText>
          <ThemedText type="default" style={{ marginBottom: 25, textAlign: 'center' }}>
            You can start your trip now or use it later.
          </ThemedText>
        </ScrollView>
      </Animated.View>

      <View style={styles.buttonCol}>
        <TouchableOpacity
          style={styles.useBtn}
          onPress={() => router.replace('/gps-window/main-gps')}
        >
          <ThemedText type="button" style={{ color: 'white' }}>
            Use the Updated Alarm
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => router.replace('/dashboard')}
        >
          <ThemedText type="button" style={{ color: '#104E3B' }}>
            Save for Later
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AlarmSetSheet;

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
    zIndex: 999,
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
