import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function ETAStatusBar({
  timeLeft = '40 mins',
  distance = '30 Km',
  eta = '00:00 AM',
}: {
  timeLeft?: string;
  distance?: string;
  eta?: string;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.leftInfo}>
        <View style={styles.row}>
          <IconSymbol name="clock" size={16} color="#fff" />
          <View style={styles.textGroup}>
            <Text style={styles.mainText}>{timeLeft}</Text>
            <Text style={styles.subText}>Time Left</Text>
          </View>
        </View>
        <View style={styles.row}>
          <IconSymbol name="location" size={16} color="#fff" />
          <View style={styles.textGroup}>
            <Text style={styles.mainText}>{distance}</Text>
            <Text style={styles.subText}>Away</Text>
          </View>
        </View>
      </View>

      <View style={styles.etaBox}>
        <Text style={styles.etaTime}>{eta}</Text>
        <Text style={styles.etaLabel}>Estimated Time Of Arrival</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#004d40',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  leftInfo: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textGroup: {
    marginLeft: 8,
  },
  mainText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  subText: {
    color: '#ccc',
    fontSize: 10,
  },
  etaBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 90,
  },
  etaTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40',
  },
  etaLabel: {
    fontSize: 10,
    color: '#444',
    textAlign: 'center',
  },
});
