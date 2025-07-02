import { SearchBox } from '@/components/SearchBox';
import { ThemedText } from '@/components/ThemedText';
import { WINDOW_HEIGHT } from '@/utils/index';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_HEIGHT = WINDOW_HEIGHT * 0.70;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0];

type Checkpoint = {
  id: string;
  name: string;
  coords: [number, number] | null;
  search: string;
};

interface Props {
  setMode: (mode: 'create' | 'checkpoints' | 'alarm') => void;
  checkpoints: Checkpoint[];
  setCheckpoints: (checkpoints: Checkpoint[]) => void;
  activeCheckpointId: string | null;
  setActiveCheckpointId: (id: string | null) => void;
  fromLocation: string; // ✅ add this
  toLocation: string;   // ✅ add this
}


const TripCheckpointsSheet: React.FC<Props> = ({ setMode, checkpoints, setCheckpoints, activeCheckpointId, setActiveCheckpointId, fromLocation, toLocation }) => {
  const [isSheetUp, setIsSheetUp] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const animatedValue = useRef(new Animated.Value(POSITIONS[1])).current;
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
      onPanResponderGrant: () => animatedValue.extractOffset(),
      onPanResponderMove: (_, gesture) => animatedValue.setValue(gesture.dy),
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
    position: 'absolute',
    width: '100%',
    height: MAX_HEIGHT,
    bottom: MIN_HEIGHT - MAX_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 3,
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
      <Animated.View style={bottomSheetStyle}>
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <ThemedText type="titleSmall">Choose Trip Checkpoints</ThemedText>
          <ThemedText type="default" style={{ marginBottom: 10 }}>
            Customize your route using checkpoints.
          </ThemedText>

          <View style={{ position: 'relative', marginBottom: 16 }}>
            <View style={styles.timelineLine} />
            <View style={[styles.checkpoint]}>
              <View style={styles.checkIconCircle} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">FROM</ThemedText>
                <ThemedText type="defaultSemiBold">{fromLocation || 'Unknown location'}</ThemedText>
              </View>
            </View>

            {checkpoints.map((cp, index) => (
              <TouchableOpacity
                key={cp.id}
                style={styles.checkpoints}
                onPress={() => {
                  setActiveCheckpointId(activeCheckpointId === cp.id ? null : cp.id);
                }}
              >
                <View style={styles.line} />
                <View style={styles.checkpointDot} />
                <View
                  style={[
                    styles.checkpointDetail,
                    activeCheckpointId === cp.id && { backgroundColor: '#CFC8F3' }, // ✅ highlight just the inner box
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <ThemedText type="option">{`CHECKPOINT ${index + 1}`}</ThemedText>
                    <TouchableOpacity onPress={() => setCheckpoints(checkpoints.filter((item) => item.id !== cp.id))}>
                      <ThemedText type="default" style={{ color: 'red' }}>✕</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <SearchBox
                    value={cp.search}
                    onChangeText={(text) => {
                      const updated = checkpoints.map((item) =>
                        item.id === cp.id ? { ...item, search: text } : item
                      );
                      setCheckpoints(updated);
                    }}
                    onSelect={(location) => {
                      const updated = checkpoints.map((item) =>
                        item.id === cp.id
                          ? { ...item, name: location.name, coords: location.coords, search: location.name }
                          : item
                      );
                      setCheckpoints(updated);
                    }}
                    placeholder="Search checkpoint"
                  />
                </View>
              </TouchableOpacity>
            ))}


            {checkpoints.length < 20 && (
              <TouchableOpacity
                style={{ marginVertical: 10, alignSelf: 'flex-start' }}
                onPress={() => {
                  const newId = Date.now().toString();
                  setCheckpoints([...checkpoints, { id: newId, name: '', coords: null, search: '' }]);
                }}
              >
                <ThemedText type="defaultSemiBold" style={{ color: '#2C7865', marginLeft: 110, marginTop: -10,}}>+ Add Checkpoint</ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">DESTINATION</ThemedText>
                <ThemedText type="defaultSemiBold">{toLocation || 'Unknown location'}</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </Animated.View>

      <View style={styles.separator} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setMode('create')}>
          <ThemedText type="button" style={{ color: '#104E3B' }}>Back</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useAlarmBtn}
          onPress={() => {
            if (!isSheetUp) {
              setShowModal(true);
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
            {isSheetUp ? 'Next' : 'Save Alarm'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ThemedText type="title" style={{ fontSize: 20, textAlign: 'center' }}>Create Alarm?</ThemedText>
            <ThemedText type="default" style={{ marginTop: 8, marginBottom: 24, textAlign: 'center' }}>
              Proceeding will create and lock in your route.
            </ThemedText>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancel}>
                <ThemedText type="button" style={{ color: '#104E3B' }}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setMode('alarm');
                }}
                style={styles.modalConfirm}
              >
                <ThemedText type="button" style={{ color: 'white' }}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default TripCheckpointsSheet;


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
    borderRadius: 20,
  },
  checkpoints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 20,
  },
  highlightedCheckpoint: {
    borderWidth: 2,
    borderColor: '#8CC63F',
    backgroundColor: '#F0FFE5',
    borderRadius: 12,
    padding: 10,
  },
  checkpointDetail: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    flex: 1,
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
    padding: 10,
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
    paddingHorizontal: 20,
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
  spacer: {
    marginBottom: 25,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#104E3B',
    borderRadius: 8,
  },
  modalConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#104E3B',
    borderRadius: 8,
  },
});
