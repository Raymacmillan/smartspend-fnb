import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { formatPulaShort } from '../../src/utils/currency';
import { calculateHealthScore } from '../../src/services/health/scorer';
import ScoreRing from '../../src/components/health/ScoreRing';
import ScoreBar from '../../src/components/health/ScoreBar';
import THEME from '../../src/constants/theme';
import { subscribeToUserTransactions, subscribeToUserGoals } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';
import { subMonths, addMonths, startOfMonth } from 'date-fns';
import { auth } from '../../src/services/firebase/config';

export default function Analytics() {
  const router = useRouter();
  const { state } = useStore();
  const [rawTxs, setRawTxs] = useState(null);
  const [goals, setGoals] = useState([]);
  const [targetMonth, setTargetMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    if (!auth?.currentUser) return;
    const unsubTxs = subscribeToUserTransactions(setRawTxs);
    const unsubGoals = subscribeToUserGoals(setGoals);
    return () => { unsubTxs(); unsubGoals(); };
  }, []);

  if (!rawTxs) return <SafeAreaView style={styles.container}><ActivityIndicator color={THEME.primary} style={{ marginTop: 50 }} /></SafeAreaView>;

  const m = processTransactions(rawTxs, targetMonth);
  const prev = processTransactions(rawTxs, subMonths(targetMonth, 1));

  const score = calculateHealthScore({ categories: m.categories, total: m.total, goals, prevTotal: m.prevTotal });
  const prevScore = prev ? calculateHealthScore({ categories: prev.categories, total: prev.total, goals, prevTotal: prev.prevTotal }) : null;
  const scoreDiff = prevScore ? score.total - prevScore.total : null;

  const statusLabel = score.total >= 80 ? '🟢 Excellent' : score.total >= 65 ? '🟡 Good' : score.total >= 50 ? '🟠 Average' : '🔴 Needs work';

  const trendMonths = [subMonths(targetMonth, 2), subMonths(targetMonth, 1), targetMonth].map(d => processTransactions(rawTxs, d));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setTargetMonth(d => subMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>‹</Text></TouchableOpacity>
          <Text style={styles.sub}>{m.label}</Text>
          <TouchableOpacity onPress={() => setTargetMonth(d => addMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>›</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Health score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Health Score</Text>
          <View style={styles.ringRow}>
            <ScoreRing score={score.total} size={120} />
            <View style={styles.ringInfo}>
              <Text style={styles.statusLbl}>{statusLabel}</Text>
              {scoreDiff !== null && (
                <Text style={[styles.scoreDiff, { color: scoreDiff >= 0 ? THEME.success : THEME.danger }]}>
                  {scoreDiff >= 0 ? '▲ +' : '▼ '}{Math.abs(scoreDiff)} pts vs last month
                </Text>
              )}
              <Text style={styles.scoreHint}>{score.topAction}</Text>
            </View>
          </View>
          {Object.values(score.breakdown).map((f) => (
            <ScoreBar key={f.label} score={f.score} max={f.max} label={f.label} />
          ))}
        </View>

        {/* What helped / hurt */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Factors this month</Text>
          <Text style={styles.tagsLbl}>✅ Helped</Text>
          <View style={styles.tagRow}>
            {score.helped.map((t) => (
              <View key={t} style={[styles.tag, styles.tagGood]}><Text style={styles.tagGoodTxt}>{t}</Text></View>
            ))}
          </View>
          <Text style={[styles.tagslbl, { marginTop: 8 }]}>⚠️ Needs work</Text>
          <View style={styles.tagRow}>
            {score.hurt.map((t) => (
              <View key={t} style={[styles.tag, styles.tagBad]}><Text style={styles.tagBadTxt}>{t}</Text></View>
            ))}
          </View>
        </View>

        {/* 3-month trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3-Month Spending Trend</Text>
          <View style={styles.trendRow}>
            {trendMonths.map((md, i) => {
              const maxTotal = Math.max(...trendMonths.map((t) => t.total));
              const barH = Math.max(20, Math.round((md.total / maxTotal) * 80));
              const isCurrent = i === 2;
              return (
                <View key={md.label} style={styles.trendCol}>
                  <Text style={styles.trendAmt}>{formatPulaShort(md.total)}</Text>
                  <View style={[styles.trendBar, { height: barH, backgroundColor: isCurrent ? THEME.primary : THEME.border }]} />
                  <Text style={[styles.trendLbl, isCurrent && styles.trendLblActive]}>{md.label.slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Breakdown — {m.label}</Text>
          {m.categories.map((cat, i) => {
            const pct = Math.round((cat.amount / m.total) * 100);
            const diff = cat.prevAmount ? Math.round(((cat.amount - cat.prevAmount) / cat.prevAmount) * 100) : null;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.catRow}
                onPress={() => router.push({ pathname: '/smartspend/category', params: { idx: i, time: targetMonth.getTime().toString() } })}
                activeOpacity={0.7}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.catTopRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    {diff !== null && (
                      <Text style={[styles.catDiff, { color: diff > 0 ? THEME.danger : THEME.success }]}>
                        {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
                <Text style={styles.catAmt}>{formatPulaShort(cat.amount)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/smartspend/recommendations', params: { time: targetMonth.getTime().toString() } })}>
            <Text style={styles.actionBtnTxt}>💡 Recommendations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnAlt]} onPress={() => router.push({ pathname: '/smartspend/charges', params: { time: targetMonth.getTime().toString() } })}>
            <Text style={[styles.actionBtnTxt, styles.actionBtnAltTxt]}>💳 Bank Charges</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 12, fontWeight: '600' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontSize: 18, lineHeight: 22 },
  scroll: { padding: 12, gap: 12 },
  card: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, marginBottom: 12 },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  ringInfo: { flex: 1, gap: 4 },
  statusLbl: { fontSize: 13, fontWeight: '700', color: THEME.text },
  scoreDiff: { fontSize: 12, fontWeight: '600' },
  scoreHint: { fontSize: 10, color: THEME.textSub, lineHeight: 15, marginTop: 4 },
  tagslbl: { fontSize: 10, color: THEME.textSub, marginBottom: 4 },
  tagsLbl: { fontSize: 10, color: THEME.textSub, marginBottom: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  tagGood: { backgroundColor: THEME.successFade },
  tagBad: { backgroundColor: THEME.warningFade },
  tagGoodTxt: { fontSize: 9, color: THEME.success, fontWeight: '600' },
  tagBadTxt: { fontSize: 9, color: THEME.warning, fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110, paddingTop: 20 },
  trendCol: { alignItems: 'center', gap: 4, flex: 1 },
  trendAmt: { fontSize: 8, color: THEME.textSub, textAlign: 'center' },
  trendBar: { width: 32, borderRadius: 4 },
  trendLbl: { fontSize: 10, color: THEME.textSub, fontWeight: '600' },
  trendLblActive: { color: THEME.primary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  catEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 11, fontWeight: '600', color: THEME.text },
  catDiff: { fontSize: 10, fontWeight: '700' },
  catTrack: { height: 5, backgroundColor: THEME.border, borderRadius: 3 },
  catFill: { height: 5, borderRadius: 3 },
  catAmt: { fontSize: 12, fontWeight: '700', color: THEME.text, minWidth: 48, textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionBtnAlt: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border },
  actionBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnAltTxt: { color: THEME.text },
});
