import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/store';
import { MONTHS_ORDER } from '../src/data/sampleTransactions';
import { formatPula, formatPulaShort } from '../src/utils/currency';
import THEME from '../src/constants/theme';

export default function Category() {
  const router = useRouter();
  const { idx } = useLocalSearchParams();
  const { state } = useStore();
  const { currentMonth, transactions } = state;
  const m = transactions[currentMonth];
  const cat = m.categories[Number(idx)];

  if (!cat) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pct = Math.round((cat.amount / m.total) * 100);
  const diff = cat.prevAmount ? Math.round(((cat.amount - cat.prevAmount) / cat.prevAmount) * 100) : null;
  const prevKey = MONTHS_ORDER[MONTHS_ORDER.indexOf(currentMonth) - 1];
  const prevLabel = prevKey ? transactions[prevKey].label : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { backgroundColor: cat.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.catEmoji}>{cat.emoji}</Text>
          <Text style={styles.title}>{cat.name}</Text>
          <Text style={styles.sub}>{m.label}</Text>
        </View>
        <View style={styles.amtBox}>
          <Text style={styles.amt}>{formatPulaShort(cat.amount)}</Text>
          <Text style={styles.pctTxt}>{pct}% of total</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>{cat.transactions.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg per transaction</Text>
            <Text style={styles.statValue}>{formatPulaShort(cat.amount / cat.transactions.length)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>vs {prevLabel || 'Last month'}</Text>
            <Text style={[styles.statValue, { color: diff === null ? THEME.text : diff > 0 ? THEME.danger : THEME.success }]}>
              {diff === null ? 'N/A' : `${diff > 0 ? '▲ +' : '▼ '}${Math.abs(diff)}%`}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share of Monthly Spending</Text>
          <View style={styles.progTrack}>
            <View style={[styles.progFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
          </View>
          <Text style={styles.progTxt}>{formatPulaShort(cat.amount)} out of {formatPulaShort(m.total)} total spending</Text>
        </View>

        {/* Transactions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transactions</Text>
          {cat.transactions.map((t) => (
            <View key={t.id} style={styles.txRow}>
              <View style={[styles.txDot, { backgroundColor: cat.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.txName}>{t.name}</Text>
                <Text style={styles.txDate}>{t.date}</Text>
              </View>
              <Text style={styles.txAmt}>{formatPulaShort(t.amount)}</Text>
            </View>
          ))}
          <View style={styles.txTotal}>
            <Text style={styles.txTotalLabel}>Total</Text>
            <Text style={[styles.txTotalAmt, { color: cat.color }]}>{formatPulaShort(cat.amount)}</Text>
          </View>
        </View>

        {/* vs previous */}
        {cat.prevAmount != null && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Month-on-Month Comparison</Text>
            <View style={styles.compareRow}>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{prevLabel || 'Last month'}</Text>
                <Text style={styles.compareAmt}>{formatPulaShort(cat.prevAmount)}</Text>
              </View>
              <Text style={styles.compareArrow}>→</Text>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{m.label}</Text>
                <Text style={[styles.compareAmt, { color: diff != null && diff > 0 ? THEME.danger : THEME.success }]}>
                  {formatPulaShort(cat.amount)}
                </Text>
              </View>
              {diff !== null && (
                <View style={[styles.diffBadge, { backgroundColor: diff > 0 ? THEME.dangerFade : THEME.successFade }]}>
                  <Text style={[styles.diffBadgeTxt, { color: diff > 0 ? THEME.danger : THEME.success }]}>
                    {diff > 0 ? '+' : ''}{diff}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingBottom: 20 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  catEmoji: { fontSize: 22, marginBottom: 2 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  sub: { color: '#ffffff99', fontSize: 11, marginTop: 1 },
  amtBox: { alignItems: 'flex-end', marginTop: 4 },
  amt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  pctTxt: { color: '#ffffff99', fontSize: 10 },
  scroll: { padding: 14, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: THEME.card, borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  statLabel: { fontSize: 9, color: THEME.textSub, marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: THEME.text },
  card: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, marginBottom: 10 },
  progTrack: { height: 8, backgroundColor: THEME.border, borderRadius: 4, marginBottom: 6 },
  progFill: { height: 8, borderRadius: 4 },
  progTxt: { fontSize: 10, color: THEME.textSub },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  txDot: { width: 8, height: 8, borderRadius: 4 },
  txName: { fontSize: 12, fontWeight: '600', color: THEME.text },
  txDate: { fontSize: 9, color: THEME.textSub, marginTop: 1 },
  txAmt: { fontSize: 13, fontWeight: '700', color: THEME.text },
  txTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: THEME.border },
  txTotalLabel: { fontSize: 12, fontWeight: '700', color: THEME.text },
  txTotalAmt: { fontSize: 15, fontWeight: '900' },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  compareCol: { flex: 1 },
  compareLabel: { fontSize: 9, color: THEME.textSub, marginBottom: 4 },
  compareAmt: { fontSize: 18, fontWeight: '800', color: THEME.text },
  compareArrow: { fontSize: 18, color: THEME.textLight },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  diffBadgeTxt: { fontSize: 12, fontWeight: '800' },
});
