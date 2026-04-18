import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import { percentOfTotal, percentChange } from '../../src/utils/math';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function CategoryDetail() {
  const router = useRouter();
  const { idx } = useLocalSearchParams();
  const { state } = useStore();
  const m = state.transactions[state.currentMonth];
  const cat = m.categories[parseInt(idx)];

  if (!cat) return null;

  const pct = percentOfTotal(cat.amount, m.total);
  const diff = percentChange(cat.amount, cat.prevAmount);
  const up = cat.amount > cat.prevAmount;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{cat.name}</Text>
        <Text style={styles.subtitle}>{m.label} · {pct}% of total</Text>
      </View>

      <ScrollView>
        <View style={[styles.hero, { backgroundColor: cat.color }]}>
          <Text style={styles.heroName}>{cat.emoji}  {cat.name}</Text>
          <Text style={styles.heroAmt}>{formatPula(cat.amount)}</Text>
          <Text style={styles.heroPct}>{pct}% of total spending</Text>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>{cat.name} insight</Text>
          <Text style={styles.hintText}>
            You spent {Math.abs(diff).toFixed(0)}% {up ? 'more' : 'less'} on {cat.name} compared to last month ({formatPulaShort(cat.prevAmount)} → {formatPulaShort(cat.amount)}).
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Transactions this month</Text>
        {cat.transactions.map((t) => (
          <View key={t.id} style={styles.txnRow}>
            <View style={styles.txnLeft}>
              <View style={[styles.txnIcon, { backgroundColor: cat.color + '33' }]}>
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
              </View>
              <View>
                <Text style={styles.txnName}>{t.name}</Text>
                <Text style={styles.txnDate}>{t.date}</Text>
              </View>
            </View>
            <Text style={styles.txnAmt}>−{formatPula(t.amount)}</Text>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },
  hero: { marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16 },
  heroName: { color: '#fff', fontSize: 14, fontWeight: '800' },
  heroAmt: { color: '#fff', fontSize: 24, fontWeight: '800', marginVertical: 4 },
  heroPct: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  hint: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: COLORS.tealFade,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
    borderRadius: 8,
    padding: 10,
  },
  hintTitle: { fontSize: 10, color: COLORS.tealDark, fontWeight: '700', marginBottom: 3 },
  hintText: { fontSize: 11, color: '#004d44' },
  sectionLabel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 16,
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnName: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  txnDate: { fontSize: 10, color: COLORS.muted },
  txnAmt: { fontSize: 12, fontWeight: '700', color: COLORS.red },
});