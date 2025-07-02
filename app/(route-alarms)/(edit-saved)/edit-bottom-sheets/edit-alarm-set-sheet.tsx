import { ThemedText } from '@/components/ThemedText';
import { WINDOW_HEIGHT } from '@/utils/index';
import { saveRoute } from '@/utils/savedRoutesAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import uuid from 'react-native-uuid';

const MAX_HEIGHT = WINDOW_HEIGHT * 0.55;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.55;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0];

interface AlarmUpdateSheetProps {
  alarmSoundIndex: number;
  vibrationEnabled: boolean;
  notifyEarlierIndex: number;
  fromPlaceName: string;
  toPlaceName: string;
  fromCoords: [number, number] | null;
  toCoords: [number, number] | null;
  checkpoints: {
    id: string;
    name: string;
    coords: [number, number] | null;
    search: string;
  }[];
}

const AlarmUpdateSheet: React.FC<AlarmUpdateSheetProps> = ({
  alarmSoundIndex,
  vibrationEnabled,
  notifyEarlierIndex,
  fromPlaceName,
  toPlaceName,
  fromCoords,
  toCoords,
  checkpoints,
}) => {
  const animatedValue = useRef(new Animated.Value(POSITIONS[1])).current;
  const currentPosition = useRef(1);
  const savedRouteId = useRef(uuid.v4());

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => animatedValue.extractOffset(),
      onPanResponderMove: (_, gesture) => animatedValue.setValue(gesture.dy),
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

  const alarmSounds = ['alarm1', 'alarm2', 'alarm3'];
  const notifyOptions = [300, 500, 700]; // meters

  const saveTripData = async (): Promise<boolean> => {
    try {
      if (!fromCoords || !toCoords) {
        console.warn('⚠️ Missing coordinates. Not saving trip.');
        return false;
      }

      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found in storage');

      const route = {
        user_id: userId,
        saved_route_id: savedRouteId.current as string,
        date_modified: new Date().toISOString(),
        from: {
          lat: fromCoords[1],
          lng: fromCoords[0],
        },
        from_name: fromPlaceName,
        destination: {
          lat: toCoords[1],
          lng: toCoords[0],
        },
        destination_name: toPlaceName,
        checkpoints: checkpoints.map((cp) => ({
          lat: cp.coords?.[1] || 0,
          lng: cp.coords?.[0] || 0,
        })),
        alarm_sound: alarmSounds[alarmSoundIndex] ?? 'alarm1',
        vibration: vibrationEnabled,
        notif_early: notifyOptions[notifyEarlierIndex] ?? 300,
      };

      await saveRoute(route);
      console.log('✅ Trip data saved');
      return true;
    } catch (err) {
      console.error('❌ Error saving trip data:', err);
      return false;
    }
  };

  const handleUseAndSave = async () => {
    const success = await saveTripData();
    if (success) {
      router.replace({
        pathname: '/gps-window/main-gps',
        params: {
          savedRouteId: savedRouteId.current as string,
        },
      });
    }
  };

  const handleSaveForLater = async () => {
    const success = await saveTripData();
    if (success) {
      router.replace('/dashboard');
    }
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
            Your alarm has been updated.
          </ThemedText>
          <ThemedText type="default" style={{ marginBottom: 25, textAlign: 'center' }}>
            You can start your trip now or use it later.
          </ThemedText>
        </ScrollView>
      </Animated.View>

      <View style={styles.buttonCol}>
        <TouchableOpacity style={styles.useBtn} onPress={handleUseAndSave}>
          <ThemedText type="button" style={{ color: 'white' }}>
            Use the Updated Alarm
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveForLater}>
          <ThemedText type="button" style={{ color: '#104E3B' }}>
            Save for Later
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AlarmUpdateSheet;


const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
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
