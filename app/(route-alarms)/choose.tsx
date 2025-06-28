import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stack, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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
        
                      <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.backCircle}>
                    <View style={styles.headerTopRow}>
                        <IconSymbol name="arrow.left.circle" size={20} color="#145E4D" />
                    </View>
                    
                      <ThemedText type="defaultSemiBold" style={styles.backText}>Back</ThemedText>
                    
                      </TouchableOpacity>
        <View style={styles.container2}>
          <ThemedText type="titleLarge" style={{ color: '#CFC8F3' }}>
            WakePoint
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/saved-routes')}
        >
          <ThemedText type="button">Use a Saved Alarm</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button2}
          onPress={() => router.push('/map-screen?mode=create')}
        >
          <ThemedText type="button" style={{ color: '#ffffff' }}>
            Create New
          </ThemedText>
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    padding: 4,
  },
  backCircle: {
    position: 'absolute',
    top: 40, // adjust based on your safe area / design
    left: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    marginLeft: 6,
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
