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
const MID_HEIGHT = WINDOW_HEIGHT * 0.51;
const MIN_HEIGHT = WINDOW_HEIGHT * 0.23;
const POSITIONS = [MIN_HEIGHT - MAX_HEIGHT, MID_HEIGHT - MAX_HEIGHT , 0];

interface Props {
  setMode: (mode: 'create' | 'checkpoints' | 'alarm') => void;
}

const CreateTripSheet: React.FC<Props> = ({ setMode }) => {
  const animatedValue = useRef(new Animated.Value(POSITIONS[1])).current;
  const currentPosition = useRef(1);

  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(false);
  const [notifyEarlierEnabled, setNotifyEarlierEnabled] = React.useState(false);

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

          <View style={{ position: 'relative'}}>
            <View style={styles.timelineLine} />

            <View style={styles.checkpoint}>
              <View style={styles.checkIconCircle} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">FROM</ThemedText>
                <ThemedText type="defaultSemiBold">
                  From
                </ThemedText>
              </View>
            </View>

            <View style={styles.checkpoint}>
              <View style={styles.finalPin} />
              <View style={styles.checkpointTextBox}>
                <ThemedText type="option">DESTINATION</ThemedText>
                <ThemedText type="defaultSemiBold">Destination</ThemedText>
              </View>
            </View>
          </View>
          

          <View style={styles.separator} />

          <ThemedText type="titleSmall" style={{ marginTop: 12, marginBottom: 12 }}>
            Alarm Settings
          </ThemedText>

          <View style={[styles.settings]}>
              {[ 
              { label: 'Alarm sound', subtitle: 'Default tone', value: soundEnabled, onChange: setSoundEnabled },
              { label: 'Vibration', subtitle: 'Silent alert', value: vibrationEnabled, onChange: setVibrationEnabled },
              { label: 'Notify me earlier', subtitle: '300m alert', value: notifyEarlierEnabled, onChange: setNotifyEarlierEnabled },
            ].map((setting, idx) => (
              <React.Fragment key={idx}>
                <View style={[styles.settingRow, { marginVertical: 8 }]}>
                  <View>
                    <ThemedText type="defaultSemiBold">{setting.label}</ThemedText>
                    <ThemedText type="default">{setting.subtitle}</ThemedText>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={setting.onChange}
                    trackColor={{ false: '#E0E0E0', true: '#104E3B' }}
                    thumbColor={setting.value ? '#fff' : '#d3d3d3'}
                  />
                </View>
                {idx < 2 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View >
          

          <View style={{ height: 40 }} /> {/* Spacer for buttons */}
        </ScrollView>
      </Animated.View>


      <View style={styles.separator} />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()} // You can also add a modal confirm here
        >
          <ThemedText type="button" style={{ color: '#104E3B' }}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.useAlarmBtn}
          onPress={() => setMode('checkpoints')}
        >
          <ThemedText type="button" style={{ color: 'white' }}>
            Next
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CreateTripSheet;

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
  settings: {
    marginBottom: 25,
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
  top:20,
  bottom: 55,
  width: 2,
  backgroundColor: '#8CC63F',
  zIndex: -1,
  },
});
