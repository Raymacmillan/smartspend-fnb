import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatPulaShort } from '../../utils/currency';
import { percentOfTotal } from '../../utils/math';
import COLORS from '../../constants/colors';

export default function CategoryRow({ category, total, onPress }) {
  const pct = percentOfTotal(category.amount, total);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.dot, { backgroundColor: category.color }]} />
      <Text style={styles.name}>{category.name}</Text>
      <Text style={styles.pct}>{pct}%</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { backgroundColor: category.color, width: `${pct}%` }]} />
      </View>
      <Text style={styles.amount}>{formatPulaShort(category.amount)}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontSize: 11,
    color: COLORS.text,
  },
  pct: {
    fontSize: 9,
    color: COLORS.muted,
    width: 26,
    textAlign: 'right',
  },
  track: {
    width: 48,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  amount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 46,
    textAlign: 'right',
  },
  arrow: {
    fontSize: 11,
    color: '#bbb',
    marginLeft: 2,
  },
});