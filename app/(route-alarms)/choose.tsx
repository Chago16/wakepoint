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
        <View style={styles.container2}>
        <ThemedText type="titleLarge" style={{ color: '#CFC8F3' }}>
          WakePoint
        </ThemedText>
        </View>
        <TouchableOpacity style={styles.button}>
          <ThemedText type="button">Use a Saved Alarm</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button2}>
          <ThemedText type="button" style={{ color: '#ffffff' }}>Create New</ThemedText>
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
  container2: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 7,
    marginVertical: 10,
    width: '80%',
    elevation: 5,
  },
  button2: {
    backgroundColor: '#145E4D',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 7,
    marginVertical: 10,
    width: '80%',
    elevation: 5,
  },
});
