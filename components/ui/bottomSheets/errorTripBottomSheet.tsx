import React from 'react';
import { View, Image, Pressable, StyleSheet, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type ErrorTripBottomSheetProps = {
  visible: boolean;
  onRetry: () => void;
  onCancel: () => void;
};

export const ErrorTripBottomSheet = ({
  visible,
  onRetry,
  onCancel,
}: ErrorTripBottomSheetProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Image
            source={require('@/assets/images/dart-target.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <ThemedText type="titleSmall" style={styles.title}>
            Oops! Seems we have{'\n'}a problem
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Select a valid location
          </ThemedText>

          <View style={styles.buttonRow}>
            <Pressable onPress={onRetry} style={styles.retryButton}>
              <ThemedText type="button" style={styles.retryText}>
                Retry
              </ThemedText>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <ThemedText type="button" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#1e6754',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: {
    color: 'white',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#1e6754',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  cancelText: {
    color: '#1e6754',
  },
});
