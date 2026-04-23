import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function ScoreBar({ score, max, label }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? COLORS.teal : pct >= 40 ? COLORS.orange : COLORS.red;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.pts}>{score}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 12 },
  label: { fontSize: 10, color: '#333', width: 120 },
  track: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3 },
  fill: { height: 6, borderRadius: 3 },
  pts: { fontSize: 10, color: COLORS.muted, width: 34, textAlign: 'right' },
});
