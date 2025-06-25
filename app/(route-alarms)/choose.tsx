import { Stack } from 'expo-router';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function ChooseScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <View style={styles.container}>
        <ThemedText type="titleLarge">
          WakePoint
        </ThemedText>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Use a Saved Alarm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create New</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#145E4D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#CFC8F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#145E4D',
    fontWeight: '600',
  },
});
