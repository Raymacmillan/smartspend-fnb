import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function ScoreRing({ score, size = 130 }) {
  const color = score >= 75 ? COLORS.teal : score >= 50 ? COLORS.orange : COLORS.red;
  const borderWidth = Math.round(size * 0.085);
  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.num, { color, fontSize: size * 0.26 }]}>{score}</Text>
      <Text style={styles.outOf}>out of 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontWeight: '800' },
  outOf: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
});
