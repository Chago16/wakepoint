import { ThemedText } from '@/components/ThemedText'; // adjust path if needed
import React from 'react';
import { StyleSheet, View } from 'react-native';

const InstructionBanner = () => {
  return (
    <View style={styles.instructionBanner}>
      {/* TIP and Instruction inline */}
      <View style={styles.tipRow}>
        <ThemedText type="default" style={styles.tipText}>
            <ThemedText type="defaultSemiBold" style={styles.tipLabel}>TIP:</ThemedText> Tap a location box to drop a pin. Tap again to disable map interaction. You can also search for a location using the searchbox.
        </ThemedText>
      </View>

      {/* Legend centered */}
      <View style={styles.selectionLegend}>
        <View style={[styles.selectionIndicator, styles.selected]} />
        <ThemedText type="default" style={styles.legendLabel}>Selected</ThemedText>

        <View style={[styles.selectionIndicator, styles.unselected]} />
        <ThemedText type="default" style={styles.legendLabel}>Unselected</ThemedText>
      </View>
    </View>
  );
};

export default InstructionBanner;


const styles = StyleSheet.create({
  instructionBanner: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    marginTop: 35,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 10,
    borderRadius: 40,
    borderColor: '#ccc',
    flexDirection: 'column',
    maxWidth: '90%',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  tipLabel: {
    color: '#104E3B',
    fontSize: 13,
    marginRight: 6,
    lineHeight: 15,
  },
  tipText: {
    color: '#104E3B',
    fontSize: 13,
    flexShrink: 1,
    lineHeight: 13,
    textAlign: 'justify', //
  },
  selectionLegend: {
    flexDirection: 'row',
    justifyContent: 'center', // ✅ centers the row
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  selectionIndicator: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 4,
  },
  selected: {
    backgroundColor: '#CFC8F3',
    borderWidth: 1.5,
    borderColor: '#A7A7C0',
  },
  unselected: {
    backgroundColor: '#E2E2E2',
    borderWidth: 1.5,
    borderColor: '#A7A7C0',
  },
  legendLabel: {
    fontSize: 13,
    marginRight: 10,
    color: '#104E3B',
  },
});

