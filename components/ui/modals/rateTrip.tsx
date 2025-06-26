import React, { useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';

type RateTripModalProps = {
  visible: boolean;
  onClose: () => void;
  onRate?: (rating: number) => void;
};

export const RateTripModal = ({ visible, onClose, onRate }: RateTripModalProps) => {
  const [rating, setRating] = useState(0);

  const handleStarPress = (index: number) => {
    setRating(index);
    onRate?.(index);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ThemedText type="titleSmall" style={styles.title}>
            How was your trip{'\n'}with wakepoint?
          </ThemedText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Pressable key={index} onPress={() => handleStarPress(index)}>
                <FontAwesome
                  name={index <= rating ? 'star' : 'star-o'}
                  size={36}
                  color="#A3D955"
                />
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} style={styles.button}>
            <ThemedText type="button" style={styles.buttonText}>
              Close
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e6754',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
  },
});
