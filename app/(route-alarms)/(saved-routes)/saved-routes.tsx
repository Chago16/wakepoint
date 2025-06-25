import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.26;

const sampleRoutes = [
  {
    start: 'Home',
    checkpoints: ['Checkpoint A', 'Checkpoint B'],
    destination: 'Office',
  },
  {
    start: 'School',
    checkpoints: ['Checkpoint 1', 'Checkpoint 2'],
    destination: 'Mall',
  },
  {
    start: 'Gym',
    checkpoints: ['Checkpoint X'],
    destination: 'Coffee Shop',
  },
];

export default function ChooseScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleUseAsAlarm = () => {
    if (selectedIndex !== null) {
      console.log('Selected Route:', sampleRoutes[selectedIndex]);
      router.push('/pretrip-options');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          animation: 'none',
          header: () => (
            <View style={styles.customHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
                  <IconSymbol name="arrow.left.circle" size={20} color="#145E4D" />
                </TouchableOpacity>
                <ThemedText type="button" style={styles.backText}>
                  Back
                </ThemedText>
              </View>
              <View style={styles.headerTitleContainer}>
                <ThemedText type="titleLarge" style={[styles.headerTitle, { fontSize: 28 }]}>
                  Saved Routes
                </ThemedText>
                <ThemedText type="subtitle1" style={[styles.headerSubtitle, { fontSize: 15 }]}>
                  Select one to set as alarm
                </ThemedText>
              </View>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {sampleRoutes.map((route, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndex(index)}
              activeOpacity={0.8}
              style={[
                styles.tripCard,
                selectedIndex === index && styles.tripCardSelected,
              ]}
            >
              <View style={styles.tripTop}>
                <ThemedText type="defaultSemiBold">Starting point</ThemedText>
              </View>
              <View style={styles.checkpoints}>
                {route.checkpoints.map((cp, i) => (
                  <ThemedText type="default" key={i}>
                    |  {cp}
                  </ThemedText>
                ))}
              </View>
              <View style={styles.tripBottom}>
                <ThemedText type="defaultSemiBold">Destination</ThemedText>
                <View style={styles.radioDotOuter}>
                  {selectedIndex === index && <View style={styles.radioDotInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.useButton,
              selectedIndex === null && styles.useButtonDisabled,
            ]}
            onPress={handleUseAsAlarm}
            disabled={selectedIndex === null}
          >
            <ThemedText type='button' style={[{ color: 'white' }]}>Use as Alarm</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: '#145E4D',
    height: HEADER_HEIGHT,
    paddingTop: 40,
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
    elevation: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 55,
  },
  backCircle: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  backText: {
    color: 'white',
    marginLeft: 6,
  },
  headerTitleContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: -10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  tripCard: {
    borderWidth: 2,
    borderColor: '#155E54',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  tripCardSelected: {
    backgroundColor: '#e6f5f2',
    borderColor: '#0C4037',
  },
  tripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkpoints: {
    marginLeft: 8,
    gap: 2,
  },
  tripBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#155E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#155E54',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  useButton: {
    backgroundColor: '#145E4D',
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
  },
  useButtonDisabled: {
    backgroundColor: '#A5C1BA',
  },
  useButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
