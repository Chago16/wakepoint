import { SearchBox } from '@/components/SearchBox';
import { ThemedText } from '@/components/ThemedText';
import { WINDOW_HEIGHT } from '@/utils/index';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_HEIGHT = WINDOW_HEIGHT * 0.70;
const MID_HEIGHT = WINDOW_HEIGHT * 0.44;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, MID_HEIGHT - MAX_HEIGHT, 0];

interface Props {
  setMode: (mode: 'create' | 'checkpoints' | 'alarm') => void;
  activePoint: 'from' | 'to' | null;
  setActivePoint: (point: 'from' | 'to' | null) => void;
  fromPlaceName: string;
  setFromPlaceName: (name: string) => void;
  fromCoords: [number, number] | null;
  setFromCoords: (coords: [number, number]) => void;
  toPlaceName: string;
  setToPlaceName: (name: string) => void;
  toCoords: [number, number] | null;
  setToCoords: (coords: [number, number]) => void;
  alarmSoundIndex: number;
  setAlarmSoundIndex: (index: number) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (value: boolean) => void;
  notifyEarlierIndex: number;
  setNotifyEarlierIndex: (index: number) => void;
}

const alarmSounds = ['Alarm 1', 'Alarm 2', 'Alarm 3'];
const notifyDistances = [300, 500, 700];

export const CreateTripSheet: React.FC<Props> = ({
  setMode,
  activePoint,
  setActivePoint,
  fromPlaceName,
  setFromPlaceName,
  fromCoords,
  setFromCoords,
  toPlaceName,
  setToPlaceName,
  toCoords,
  setToCoords,
  alarmSoundIndex,
  setAlarmSoundIndex,
  vibrationEnabled,
  setVibrationEnabled,
  notifyEarlierIndex,
  setNotifyEarlierIndex,
}) => {
  const animatedValue = useRef(new Animated.Value(POSITIONS[0])).current;
  const currentPosition = useRef(0); // start at max
  const searchJustFocusedRef = useRef(false); // prevent flickering

  const cycleLeft = (index: number, list: any[]) =>
    index === 0 ? list.length - 1 : index - 1;

  const cycleRight = (index: number, list: any[]) =>
    index === list.length - 1 ? 0 : index + 1;

  const snapToMax = () => {
    currentPosition.current = 0;
    Animated.spring(animatedValue, {
      toValue: POSITIONS[0],
      useNativeDriver: true,
    }).start();
  };

  const snapToMin = () => {
    currentPosition.current = 1;
    Animated.spring(animatedValue, {
      toValue: POSITIONS[1],
      useNativeDriver: true,
    }).start();
  };

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

  const isNextDisabled = !fromCoords || !toCoords;

  return (
    <>
      <Animated.View style={bottomSheetStyle}>
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="titleSmall">Create Trip Alarm</ThemedText>
          <ThemedText type="default" style={{ marginBottom: 25 }}>
            We will wake you up. Don’t worry!
          </ThemedText>

          <View style={{ position: 'relative' }}>
            <View style={styles.timelineLine} />

            <View style={styles.checkpoint}>
              <View style={styles.checkIconCircle} />
              <View
                style={[
                  styles.fromContainer,
                  activePoint === 'from' && { backgroundColor: '#CFC8F3' },
                ]}
                onTouchEnd={() => {
                  setActivePoint(activePoint === 'from' ? null : 'from');
                  if (!searchJustFocusedRef.current) {
                    snapToMin();
                  }
                }}
              >
                <ThemedText type="option">FROM</ThemedText>
                <SearchBox
                  value={fromPlaceName}
                  onChangeText={setFromPlaceName}
                  onSelect={(place) => {
                    setFromCoords(place.coords);
                    setFromPlaceName(place.name);
                  }}
                  onFocus={() => {
                    searchJustFocusedRef.current = true;
                    snapToMax();
                    setTimeout(() => {
                      searchJustFocusedRef.current = false;
                    }, 100);
                  }}
                />
              </View>
            </View>

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View
                style={[
                  styles.destinationContainer,
                  activePoint === 'to' && { backgroundColor: '#CFC8F3' },
                ]}
                onTouchEnd={() => {
                  setActivePoint(activePoint === 'to' ? null : 'to');
                  if (!searchJustFocusedRef.current) {
                    snapToMin();
                  }
                }}
              >
                <ThemedText type="option">DESTINATION</ThemedText>
                <SearchBox
                  value={toPlaceName}
                  onChangeText={setToPlaceName}
                  onSelect={(place) => {
                    setToCoords(place.coords);
                    setToPlaceName(place.name);
                  }}
                  onFocus={() => {
                    searchJustFocusedRef.current = true;
                    snapToMax();
                    setTimeout(() => {
                      searchJustFocusedRef.current = false;
                    }, 100);
                  }}
                />
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <ThemedText type="titleSmall" style={{ marginTop: 12, marginBottom: 12 }}>
            Alarm Settings
          </ThemedText>

          <View style={styles.settings}>
            <View style={[styles.settingRow, { marginVertical: 8 }]}>
              <ThemedText type="defaultSemiBold">Alarm sound</ThemedText>
              <View style={styles.pickerRow}>
                <TouchableOpacity onPress={() => setAlarmSoundIndex(cycleLeft(alarmSoundIndex, alarmSounds))}>
                  <ThemedText type="default">{'<'}</ThemedText>
                </TouchableOpacity>
                <ThemedText type="default" style={{ marginHorizontal: 12 }}>
                  {alarmSounds[alarmSoundIndex]}
                </ThemedText>
                <TouchableOpacity onPress={() => setAlarmSoundIndex(cycleRight(alarmSoundIndex, alarmSounds))}>
                  <ThemedText type="default">{'>'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={[styles.settingRow, { marginVertical: 8 }]}>
              <ThemedText type="defaultSemiBold">Vibration</ThemedText>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#E0E0E0', true: '#104E3B' }}
                thumbColor={vibrationEnabled ? '#fff' : '#d3d3d3'}
              />
            </View>

            <View style={styles.separator} />

            <View style={[styles.settingRow, { marginVertical: 8 }]}>
              <ThemedText type="defaultSemiBold">Notify me earlier</ThemedText>
              <View style={styles.pickerRow}>
                <TouchableOpacity onPress={() => setNotifyEarlierIndex(cycleLeft(notifyEarlierIndex, notifyDistances))}>
                  <ThemedText type="default">{'<'}</ThemedText>
                </TouchableOpacity>
                <ThemedText type="default" style={{ marginHorizontal: 12 }}>
                  {notifyDistances[notifyEarlierIndex]} m
                </ThemedText>
                <TouchableOpacity onPress={() => setNotifyEarlierIndex(cycleRight(notifyEarlierIndex, notifyDistances))}>
                  <ThemedText type="default">{'>'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      <View style={styles.separator} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <ThemedText type="button" style={{ color: '#104E3B' }}>
            Cancel
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.useAlarmBtn, {opacity: isNextDisabled ? 0.5 : 1 }]}
          disabled={isNextDisabled}
          onPress={() => {
            setActivePoint(null);
            setMode('checkpoints');
          }}
        >
          <ThemedText type="button" style={{ color: 'white'}}>
            Next
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

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
    borderWidth: 4.5,
    borderColor: '#8CC63F',
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
  fromContainer: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  destinationContainer: {
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
  settings: {
    marginBottom: 25,
  },
  pickerRow: {
    width: 100,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  timelineLine: {
    position: 'absolute',
    left: 7.3,
    top: 20,
    bottom: 65,
    width: 2,
    backgroundColor: '#8CC63F',
    zIndex: -1,
  },
});
