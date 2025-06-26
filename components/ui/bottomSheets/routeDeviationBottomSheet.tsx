import React from 'react';
import { Modal, View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type RouteDeviationBottomSheetProps = {
  visible: boolean;
  onConfirm: () => void;
};

export const RouteDeviationBottomSheet = ({
  visible,
  onConfirm,
}: RouteDeviationBottomSheetProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
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
            Possibly due to traffic or other issues.
          </ThemedText>

          <Pressable onPress={onConfirm} style={styles.okButton}>
            <ThemedText type="button" style={styles.okText}>
              Okay
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
