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
const MIN_HEIGHT = WINDOW_HEIGHT * 0.25;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0];

interface Props {
  setMode: (mode: 'edit' | 'checkpoints' | 'alarm') => void;
}

const TripCheckpointsSheet: React.FC<Props> = ({ setMode }) => {
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
      <View style={styles.instructionBanner}>
        <ThemedText type="defaultSemiBold" style={styles.instructionText}>
          TIP:    
        </ThemedText>
        <ThemedText type="default" style={[, {paddingRight: 10, fontSize: 13}]}>
          Tap the map to add as many checkpoints as you need. Use the bottom sheet to search and fine-tune them.
        </ThemedText>
      </View>

      <Animated.View style={bottomSheetStyle}>
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="titleSmall">Update Trip Checkpoints</ThemedText>
          <ThemedText type="default" style={{ marginBottom: 10 }}>
            To add a checkpoint, tap on the map. Tap again to delete.
          </ThemedText>

          <View style={{ position: 'relative', marginBottom: 16 }}>
            <View style={styles.timelineLine} />

            <View style={[styles.checkpoint]}>
              <View style={styles.checkIconCircle} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">FROM</ThemedText>
                <ThemedText type="defaultSemiBold">Sonoma Residences, Sta. Cruz</ThemedText>
              </View>
            </View>

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

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">DESTINATION</ThemedText>
                <ThemedText type="defaultSemiBold">Anonas Street, Sta. Mesa, Manila</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </Animated.View>

      <View style={styles.separator} />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setMode('edit')}
        >
          <ThemedText type="button" style={{ color: '#104E3B' }}>Back</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useAlarmBtn}
          onPress={() => {
            if (!isSheetUp) {
              setShowModal(true); // 🔴 Show confirmation modal
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
            <ThemedText type="title" style={{ fontSize: 20, textAlign: 'center' }}>
              Confirm Alarm Save
            </ThemedText>
            <ThemedText type="default" style={{ marginTop: 8, marginBottom: 24, textAlign: 'center' }}>
              Saving this alarm will update your edits. Continue?
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
  instructionBanner: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    marginTop: 35,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 10,
    borderRadius: 50,
    borderColor: '#ccc',
    flexDirection: 'row', // ✅ Change from 'row' to 'column'
    maxWidth: '90%',         // ✅ Prevent overflow on the sides
  },
  instructionText: {
    color: '#104E3B',
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
  spacer: {
    marginBottom : 25,
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
