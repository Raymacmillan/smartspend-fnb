import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';
import { auth } from '../../src/services/firebase/config';
import { subscribeToUserTransactions } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { formatPula } from '../../src/utils/currency';
import THEME from '../../src/constants/theme';

export default function Charges() {
  const router = useRouter();
  const { month, time } = useGlobalSearchParams();
  const initialDate = time ? new Date(Number(time)) : (month ? new Date(month) : startOfMonth(new Date()));
  const [targetMonth, setTargetMonth] = useState(initialDate);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.currentUser) return;
    const unsubscribe = subscribeToUserTransactions((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (time) setTargetMonth(new Date(Number(time)));
    else if (month) setTargetMonth(new Date(month));
  }, [time, month]);

  if (loading) return <ActivityIndicator color={COLORS.teal} style={{ marginTop: 50 }} />;

  const processedData = processTransactions(transactions, targetMonth);
  const prevMonthData = processTransactions(transactions, subMonths(targetMonth, 1));

  const chargesCat = processedData.categories.find((c) => c.key === 'bankCharges');
  const prevChargesCat = prevMonthData.categories.find((c) => c.key === 'bankCharges');

  const atmCat = processedData.categories.find((c) => c.key === 'atm');

  const totalWithAtm = chargesCat?.amount || 0;
  const prevTotalWithAtm = prevChargesCat?.amount || 0;
  const diff = totalWithAtm - prevTotalWithAtm;

  const feeMap = new Map();
  (chargesCat?.transactions || []).forEach((tx) => {
    const name = tx.description;
    if (!feeMap.has(name)) feeMap.set(name, { name, count: 0, amount: 0, color: COLORS.red });
    const item = feeMap.get(name);
    item.count += 1;
    item.amount += Number(tx.amount);
  });
  const items = Array.from(feeMap.values());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.ctop}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setTargetMonth(d => subMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>‹</Text></TouchableOpacity>
          <Text style={styles.cl}>Total bank charges · {format(targetMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setTargetMonth(d => addMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>›</Text></TouchableOpacity>
        </View>
        <Text style={styles.ca}>{formatPula(totalWithAtm)}</Text>
        {diff !== 0 ? (
          <Text style={[styles.ct, { color: diff > 0 ? COLORS.orange : COLORS.teal }]}>
            {diff > 0 ? 'Up' : 'Down'} {formatPula(Math.abs(diff))} from {format(subMonths(targetMonth, 1), 'MMMM')}
          </Text>
        ) : (
          <Text style={[styles.ct, { color: '#888' }]}>
            No change from {format(subMonths(targetMonth, 1), 'MMMM')}
          </Text>
        )}
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
          <Text style={styles.hintText}>Switching 3 of {atmCat?.transactions?.length || 0} ATM visits to tap-to-pay saves P25.50/month</Text>
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
  ctop: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 14 },
  cl: { color: THEME.textLight, fontSize: 11 },
  ca: { color: '#fff', fontSize: 24, fontWeight: '800', marginVertical: 2 },
  ct: { color: COLORS.orange, fontSize: 10 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontSize: 18, lineHeight: 22 },
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