import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { analyseCharges } from '../../src/services/charges/analyser';
import { formatPula } from '../../src/utils/currency';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function Charges() {
  const router = useRouter();
  const { state } = useStore();
  const m = state.transactions[state.currentMonth];
  const prev = state.transactions.feb;

  const chargesCat = m.categories.find((c) => c.key === 'bankCharges');
  const prevCharges = prev?.categories.find((c) => c.key === 'bankCharges');

  const { total, breakdown, diff } = analyseCharges(
    chargesCat?.transactions || [],
    prevCharges?.amount || 0
  );

  // Include derived ATM-related charges (8.50 × withdrawals) from prototype math
  const atmCat = m.categories.find((c) => c.key === 'atm');
  const atmFees = atmCat ? atmCat.transactions.length * 8.50 : 0;
  const totalWithAtm = total + atmFees;

  const items = [
    { name: 'ATM Withdrawals', count: atmCat?.transactions.length || 0, amount: atmFees, color: COLORS.blue },
    ...breakdown.map((b) => ({
      name: b.name,
      count: 1,
      amount: b.amount,
      color: b.color,
    })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.ctop}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.cl}>Total bank charges this month</Text>
        <Text style={styles.ca}>{formatPula(totalWithAtm)}</Text>
        <Text style={styles.ct}>Up P{Math.round(diff + atmFees)} from February</Text>
      </View>

      <ScrollView>
        <View style={{ height: 10 }} />
        <Text style={styles.sectionLabel}>Breakdown by charge type</Text>
        <View style={styles.cwrap}>
          {items.map((it, i) => (
            <View key={i} style={styles.crow}>
              <View style={styles.lft}>
                <View style={[styles.chDot, { backgroundColor: it.color }]} />
                <View>
                  <Text style={styles.chN}>{it.name}</Text>
                  <Text style={styles.chC}>{it.count} transaction{it.count !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              <Text style={styles.chA}>{formatPula(it.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Most fees came from ATM use</Text>
          <Text style={styles.hintText}>Switching 3 of {atmCat?.transactions.length || 5} ATM visits to tap-to-pay saves P25.50/month</Text>
        </View>

        <View style={[styles.hint, styles.hintPurple]}>
          <Text style={[styles.hintTitle, styles.hintTitlePurple]}>Interbank fees are avoidable</Text>
          <Text style={[styles.hintText, styles.hintTextPurple]}>FNB-to-FNB transfers are free — use them where possible</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  ctop: { backgroundColor: COLORS.black, padding: 14 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 6 },
  cl: { color: '#aaa', fontSize: 10 },
  ca: { color: '#fff', fontSize: 24, fontWeight: '800', marginVertical: 2 },
  ct: { color: COLORS.orange, fontSize: 10 },
  sectionLabel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cwrap: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  crow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  lft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chDot: { width: 8, height: 8, borderRadius: 4 },
  chN: { fontSize: 11, color: COLORS.text },
  chC: { fontSize: 9, color: COLORS.muted },
  chA: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  hint: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: COLORS.tealFade,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
    borderRadius: 8,
    padding: 10,
  },
  hintPurple: { backgroundColor: '#f3e5f5', borderLeftColor: COLORS.purple },
  hintTitle: { fontSize: 10, color: COLORS.tealDark, fontWeight: '700', marginBottom: 3 },
  hintTitlePurple: { color: '#6a1b9a' },
  hintText: { fontSize: 11, color: '#004d44' },
  hintTextPurple: { color: '#4a148c' },
});