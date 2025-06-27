import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Modal,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol'; // adjust the path if needed
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TripAlarmModalProps = {
  visible: boolean;
  onSwipeComplete: () => void;
};

export const TripAlarmModal = ({ visible, onSwipeComplete }: TripAlarmModalProps) => {
  const swipeX = useRef(new Animated.Value(0)).current;
  const maxSwipe = SCREEN_WIDTH * 0.85 - 118;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= maxSwipe) {
          swipeX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxSwipe * 0.9) {
          Animated.timing(swipeX, {
            toValue: maxSwipe,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            swipeX.setValue(0);
            console.log("Triggering haptic...");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onSwipeComplete();
          });
        } else {
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.iconRow}>
              <IconSymbol name="clock.fill" color="#1e6754" size={20} />
              <ThemedText type="subtitle2" style={styles.tripAlarmText}>
                Trip Alarm
              </ThemedText>
            </View>
            <IconSymbol name="speaker.wave.3.fill" color="#1e6754" size={20} />
          </View>

          <ThemedText type="titleLarge" style={styles.wakeUp}>
            Wake Up!
          </ThemedText>
          <ThemedText type="default" style={styles.message}>
            Your trip has reached its final destination.
          </ThemedText>

          <View style={styles.swipeContainer}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.swipeThumb,
                { transform: [{ translateX: swipeX }] },
              ]}
            />
            <ThemedText type="button" style={styles.swipeText}>
              {'Swipe to\nStop Alarm'}
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripAlarmText: {
    color: '#1e6754',
  },
  wakeUp: {
    color: '#1e6754',
    marginBottom: 10,
  },
  message: {
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  swipeContainer: {
    backgroundColor: '#1e6754',
    borderRadius: 40,
    width: '100%',
    height: 70,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  swipeThumb: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#b3e675',
    borderRadius: 35,
    left: 5,
    zIndex: 2,
  },
  swipeText: {
    color: 'white',
    textAlign: 'center',
    zIndex: 1,
  },
});
