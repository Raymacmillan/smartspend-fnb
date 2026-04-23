import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function DonutChart({ categories, total }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SPENDING BREAKDOWN</Text>
      <View style={styles.bar}>
        {categories.map((cat) => {
          const flex = Math.max(1, Math.round((cat.amount / total) * 100));
          return <View key={cat.key} style={[styles.seg, { flex, backgroundColor: cat.color }]} />;
        })}
      </View>
      <View style={styles.legend}>
        {categories.map((cat) => {
          const pct = Math.round((cat.amount / total) * 100);
          return (
            <View key={cat.key} style={styles.item}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.itemName}>{cat.emoji} {cat.name}</Text>
              <Text style={[styles.itemPct, { color: cat.color }]}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  label: { fontSize: 9, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8 },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  seg: { height: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%', paddingVertical: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  itemName: { flex: 1, fontSize: 9, color: COLORS.text },
  itemPct: { fontSize: 9, fontWeight: '700' },
});
