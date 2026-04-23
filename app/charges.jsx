import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import { MONTHS_ORDER } from '../src/data/sampleTransactions';
import { formatPula, formatPulaShort } from '../src/utils/currency';
import THEME from '../src/constants/theme';

const FEE_TIPS = [
  { icon: '💳', tip: 'Switch to tap-to-pay to avoid ATM withdrawal fees (P8.50 each).' },
  { icon: '📱', tip: 'Use the app for transfers — cheaper than branch or interbank fees.' },
  { icon: '🔄', tip: 'Consolidate airtime to 1 monthly purchase — saves per-transaction processing fees.' },
  { icon: '🏧', tip: 'Withdraw once at the start of the month instead of multiple smaller amounts.' },
];

export default function Charges() {
  const router = useRouter();
  const { state } = useStore();
  const { currentMonth, transactions } = state;
  const m = transactions[currentMonth];

  const chargesCat = m.categories.find((c) => c.key === 'bankCharges');
  const atmCat = m.categories.find((c) => c.key === 'atm');
  const atmFees = atmCat ? atmCat.transactions.length * 8.5 : 0;
  const totalFees = (chargesCat?.amount || 0) + atmFees;

  const idx = MONTHS_ORDER.indexOf(currentMonth);
  const prevKey = MONTHS_ORDER[idx - 1];
  const prev = prevKey ? transactions[prevKey] : null;
  const prevCharges = prev?.categories.find((c) => c.key === 'bankCharges');
  const prevAtm = prev?.categories.find((c) => c.key === 'atm');
  const prevTotal = (prevCharges?.amount || 0) + (prevAtm ? prevAtm.transactions.length * 8.5 : 0);
  const feesDiff = prev ? Math.round(((totalFees - prevTotal) / prevTotal) * 100) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bank Charges</Text>
          <Text style={styles.sub}>{m.label} · Fee breakdown</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Fees This Month</Text>
          <Text style={styles.summaryAmt}>{formatPula(totalFees)}</Text>
          {feesDiff !== null && (
            <Text style={[styles.feesDiff, { color: feesDiff > 0 ? THEME.danger : THEME.success }]}>
              {feesDiff > 0 ? '▲ +' : '▼ '}{Math.abs(feesDiff)}% vs {transactions[prevKey]?.label}
            </Text>
          )}
          <Text style={styles.summaryNote}>
            Across {(chargesCat?.transactions.length || 0) + (atmCat?.transactions.length || 0)} fee-generating transactions
          </Text>
        </View>

        {/* Fee breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fee Breakdown</Text>

          {chargesCat?.transactions.map((t) => (
            <View key={t.id} style={styles.feeRow}>
              <View style={styles.feeIconWrap}>
                <Text style={{ fontSize: 16 }}>🏦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feeName}>{t.name}</Text>
                <Text style={styles.feeDate}>{t.date}</Text>
              </View>
              <Text style={styles.feeAmt}>{formatPulaShort(t.amount)}</Text>
            </View>
          ))}

          {atmCat && atmCat.transactions.length > 0 && (
            <View style={styles.feeRow}>
              <View style={styles.feeIconWrap}>
                <Text style={{ fontSize: 16 }}>🏧</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feeName}>ATM Withdrawal Fees</Text>
                <Text style={styles.feeDate}>{atmCat.transactions.length} withdrawals × P8.50</Text>
              </View>
              <Text style={[styles.feeAmt, { color: THEME.danger }]}>{formatPulaShort(atmFees)}</Text>
            </View>
          )}

          <View style={styles.feeTotalRow}>
            <Text style={styles.feeTotalLabel}>Total</Text>
            <Text style={styles.feeTotalAmt}>{formatPulaShort(totalFees)}</Text>
          </View>
        </View>

        {/* Monthly comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3-Month Fee Comparison</Text>
          <View style={styles.compRow}>
            {MONTHS_ORDER.map((mk) => {
              const md = transactions[mk];
              const mCharges = md.categories.find((c) => c.key === 'bankCharges');
              const mAtm = md.categories.find((c) => c.key === 'atm');
              const mTotal = (mCharges?.amount || 0) + (mAtm ? mAtm.transactions.length * 8.5 : 0);
              const maxFee = Math.max(...MONTHS_ORDER.map((k) => {
                const kd = transactions[k];
                const kc = kd.categories.find((c) => c.key === 'bankCharges');
                const ka = kd.categories.find((c) => c.key === 'atm');
                return (kc?.amount || 0) + (ka ? ka.transactions.length * 8.5 : 0);
              }));
              const barH = Math.max(20, Math.round((mTotal / maxFee) * 80));
              return (
                <View key={mk} style={styles.compCol}>
                  <Text style={styles.compAmt}>{formatPulaShort(mTotal)}</Text>
                  <View style={[styles.compBar, { height: barH, backgroundColor: mk === currentMonth ? THEME.danger : THEME.border }]} />
                  <Text style={[styles.compLbl, mk === currentMonth && { color: THEME.danger }]}>{md.label.slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 How to Reduce Fees</Text>
          {FEE_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipTxt}>{tip.tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.advisory}>
          <Text style={styles.advisoryTxt}>⚖️ Fee estimates are indicative. Actual charges may vary. This is advisory information only — not regulated financial advice.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 10, marginTop: 1 },
  scroll: { padding: 14, gap: 12 },
  summaryCard: { backgroundColor: THEME.dark, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#ffffff10' },
  summaryLabel: { color: THEME.textLight, fontSize: 11, marginBottom: 4 },
  summaryAmt: { color: THEME.danger, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  feesDiff: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  summaryNote: { color: THEME.textLight, fontSize: 10 },
  card: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, marginBottom: 10 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  feeIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  feeName: { fontSize: 12, fontWeight: '600', color: THEME.text },
  feeDate: { fontSize: 9, color: THEME.textSub, marginTop: 1 },
  feeAmt: { fontSize: 13, fontWeight: '800', color: THEME.text },
  feeTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: THEME.border },
  feeTotalLabel: { fontSize: 12, fontWeight: '700', color: THEME.text },
  feeTotalAmt: { fontSize: 15, fontWeight: '900', color: THEME.danger },
  compRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110, paddingTop: 20 },
  compCol: { alignItems: 'center', gap: 4, flex: 1 },
  compAmt: { fontSize: 8, color: THEME.textSub },
  compBar: { width: 32, borderRadius: 4 },
  compLbl: { fontSize: 10, color: THEME.textSub, fontWeight: '600' },
  tipRow: { flexDirection: 'row', gap: 10, paddingVertical: 6, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  tipIcon: { fontSize: 16, width: 20 },
  tipTxt: { flex: 1, fontSize: 11, color: THEME.textSub, lineHeight: 17 },
  advisory: { backgroundColor: THEME.warningFade, borderRadius: 10, padding: 12 },
  advisoryTxt: { fontSize: 10, color: THEME.warning, lineHeight: 15 },
});
