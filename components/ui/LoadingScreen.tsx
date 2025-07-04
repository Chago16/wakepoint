import { ThemedText } from '@/components/ThemedText';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004d40" />
        <ThemedText type="title" style={styles.text}>Loading map...</ThemedText>

        <View style={styles.legendContainer}>
          <ThemedText type="titleSmall" style={styles.text}>NOTE:</ThemedText>
          {/* Green Dashed Line: Current Route */}
          <View style={styles.legendItem}>
            <View style={styles.dashedLine} />
            <ThemedText type="subtitle1" style={styles.legendText}>Current Route</ThemedText>
          </View>

          {/* Gray Solid Line: Planned Route */}
          <View style={styles.legendItem}>
            <View style={styles.solidLine} />
            <ThemedText type="subtitle1" style={styles.legendText}>Planned Route</ThemedText>
          </View>
        </View>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginTop: 12,
    color: '#004d40',
  },
  legendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dashedLine: {
    width: 100,
    height: 0,
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: '#2E7D32', // green
    borderStyle: 'dashed',
    marginRight: 8,
  },
  solidLine: {
    width: 100,
    height: 10,
    backgroundColor: '#888', // grey solid
    marginRight: 8,
  },
  legendText: {
    color: '#333',
    fontSize: 13,
  },
});
