import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function InsightCard({ icon, title, value, valueColor, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: valueColor + '22' }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.head}>{title}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
      <Text style={[styles.arrow, { color: COLORS.teal }]}>Tap →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    gap: 3,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 13,
  },
  head: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
  },
  sub: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 14,
  },
  arrow: {
    fontSize: 9,
  },
});