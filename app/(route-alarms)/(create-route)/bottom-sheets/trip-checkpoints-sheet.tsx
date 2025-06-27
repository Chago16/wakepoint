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

const MAX_HEIGHT = WINDOW_HEIGHT * 0.65;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, 0];

interface Props {
  setMode: (mode: 'create' | 'checkpoints' | 'alarm') => void;
}

const TripCheckpointsSheet: React.FC<Props> = ({ setMode }) => {
  const [isSheetUp, setIsSheetUp] = useState(true);
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
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setMode('create')}
        >
          <ThemedText type="button" style={{ color: '#104E3B' }}>
            Back
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useAlarmBtn}
          onPress={() => {
            if (!isSheetUp) {
              setMode('alarm');
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
