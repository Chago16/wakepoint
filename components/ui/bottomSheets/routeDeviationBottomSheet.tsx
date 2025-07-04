import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

type RouteDeviationBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export const RouteDeviationBottomSheet = ({
  visible,
  onClose,
}: RouteDeviationBottomSheetProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose} // For Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Image
            source={require('@/assets/images/dart-target.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <ThemedText type="titleSmall" style={styles.title}>
            Route Deviation{'\n'}Detected
          </ThemedText>

          <ThemedText type="default" style={styles.subtitle}>
            You seem to be off the planned route.
          </ThemedText>

          <Pressable onPress={onClose} style={styles.okButton}>
            <ThemedText type="button" style={styles.okText}>
              Got it
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#f8fafa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 190,
    marginBottom: 20,
  },
  title: {
    color: '#9B1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
  },
  okButton: {
    backgroundColor: '#1e6754',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  okText: {
    color: 'white',
  },
});
