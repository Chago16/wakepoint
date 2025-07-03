import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ETAStatusBar({
  timeLeft = '40 mins',
  distance = '30 Km',
  eta = '00:00 AM',
  fromName = 'Origin',
  destinationName = 'Destination',
  progress = 0.45,
}: {
  timeLeft?: string;
  distance?: string;
  eta?: string;
  fromName?: string;
  destinationName?: string;
  progress?: number; // value between 0 and 1
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1); // ensure 0-1 range

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.leftInfo}>
          <View style={styles.row}>
            <IconSymbol name="clock" size={24} color="#fff" />
            <View style={styles.textGroup}>
              <Text style={styles.mainText}>{timeLeft}</Text>
              <Text style={styles.subText}>Time Left</Text>
            </View>
          </View>
          <View style={styles.row}>
            <IconSymbol name="location" size={24} color="#fff" />
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

      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${clampedProgress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.justifyContainer}>
        <View style={styles.endpointLeft}>
          <ThemedText
            type="default"
            numberOfLines={2}
            style={styles.endpointText}>
            {fromName}
          </ThemedText>
        </View>
        <View style={styles.endpointRight}>
          <ThemedText
            type="default"
            numberOfLines={2}
            style={[styles.endpointText, { textAlign: 'right' }]}>
            {destinationName}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#004d40',
    borderRadius: 20,
    padding: 12,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    minWidth: 160,
    minHeight: 80,
  },
  etaTime: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#004d40',
    marginTop: 5,
  },
  etaLabel: {
    fontSize: 10,
    color: '#444',
    textAlign: 'center',
  },
  progressBarWrapper: {
    marginTop: 12,
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A69DDA',
    borderRadius: 20,
  },
  justifyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  endpointLeft: {
    maxWidth: '48%',
    minHeight: 36,
    justifyContent: 'flex-start',
  },
  endpointRight: {
    maxWidth: '48%',
    minHeight: 36,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  endpointText: {
    flexWrap: 'wrap',
    lineHeight: 18,
    color: 'white',
  },
});
