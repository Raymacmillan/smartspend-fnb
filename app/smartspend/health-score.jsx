import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { calculateHealthScore } from '../../src/services/health/scorer';
import ScoreRing from '../../src/components/health/ScoreRing';
import ScoreBar from '../../src/components/health/ScoreBar';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';
import { subscribeToUserTransactions } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';
import { useGoals } from '../../src/hooks/useGoals';
import { auth } from '../../src/services/firebase/config';
import { subMonths, addMonths, startOfMonth } from 'date-fns';
import THEME from '../../src/constants/theme';

export default function HealthScore() {
  const router = useRouter();
  const { month, time } = useGlobalSearchParams();
  const initialDate = time ? new Date(Number(time)) : (month ? new Date(month) : startOfMonth(new Date()));
  const [targetMonth, setTargetMonth] = useState(initialDate);

  const { goals } = useGoals(auth?.currentUser?.uid);
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </SafeAreaView>
    );
  }

  const m = processTransactions(transactions, targetMonth);
  const prevM = processTransactions(transactions, subMonths(targetMonth, 1));

  const score = calculateHealthScore({
    categories: m.categories,
    total: m.total,
    goals,
    prevTotal: m.prevTotal,
  });

  const prevScore = prevM.total > 0
    ? calculateHealthScore({ categories: prevM.categories, total: prevM.total, goals, prevTotal: null })
    : null;

  const scoreDiff = prevScore ? score.total - prevScore.total : null;
  const statusLabel =
    score.total >= 80 ? 'Excellent' :
    score.total >= 65 ? 'Good — room to grow' :
    score.total >= 50 ? 'Average — take action' :
    'Needs improvement';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Financial Health Score</Text>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setTargetMonth(d => subMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>‹</Text></TouchableOpacity>
          <Text style={styles.subtitle}>{m.label}</Text>
          <TouchableOpacity onPress={() => setTargetMonth(d => addMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>›</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scoreWrap}>
          <ScoreRing score={score.total} size={140} />
          <Text style={styles.scoreStatus}>{statusLabel}</Text>
          {scoreDiff !== null && (
            <Text style={[styles.scoreSub, { color: scoreDiff >= 0 ? COLORS.teal : COLORS.red }]}>
              {scoreDiff >= 0 ? '▲ +' : '▼ '}
                  {Math.abs(scoreDiff)} points vs {prevM.total > 0 ? prevM.label : 'last month'}
            </Text>
          )}
          {prevScore && (
            <Text style={styles.prevScore}>
              Previous score: {prevScore.total}/100
            </Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>Score breakdown</Text>
        <View style={styles.breakdown}>
          {Object.values(score.breakdown).map((f) => (
            <ScoreBar key={f.label} score={f.score} max={f.max} label={f.label} />
          ))}
        </View>

        <View style={styles.tagsSec}>
          <Text style={styles.tagsLabel}>
                {prevM.total > 0 ? `What helped vs ${prevM.label}` : 'Positive factors'}
          </Text>
          <View style={styles.tagRow}>
            {score.helped.map((t) => (
              <View key={t} style={[styles.tag, styles.tagGood]}>
                <Text style={styles.tagGoodTxt}>✓ {t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.tagsLabel}>
                {prevM.total > 0 ? `What hurt vs ${prevM.label}` : 'Areas to improve'}
          </Text>
          <View style={styles.tagRow}>
            {score.hurt.map((t) => (
              <View key={t} style={[styles.tag, styles.tagBad]}>
                <Text style={styles.tagBadTxt}>✗ {t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>🎯 Top action this month</Text>
          <Text style={styles.hintText}>{score.topAction}</Text>
        </View>

        <View style={styles.hint2}>
          <Text style={styles.hint2Title}>How is your score calculated?</Text>
          <Text style={styles.hint2Text}>
            Saving consistency (25 pts) · Charge efficiency (20 pts) · Discretionary spend (20 pts) · Goal progress (20 pts) · Spend stability (15 pts)
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 14 },
  back: { color: THEME.primary, fontSize: 12, marginBottom: 8, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: THEME.textLight, fontSize: 12, fontWeight: '600' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontSize: 18, lineHeight: 22 },
  scoreWrap: { alignItems: 'center', padding: 24, paddingBottom: 16 },
  scoreStatus: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 14 },
  scoreSub: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  prevScore: { fontSize: 10, color: COLORS.muted, marginTop: 3 },
  sectionLabel: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdown: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
  },
  tagsSec: { paddingHorizontal: 14, paddingTop: 12 },
  tagsLabel: { fontSize: 10, color: COLORS.muted, marginBottom: 6, marginTop: 8, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 4 },
  tagGood: { backgroundColor: '#e8f5e9' },
  tagBad: { backgroundColor: COLORS.orangeFade },
  tagGoodTxt: { fontSize: 9, color: '#2e7d32' },
  tagBadTxt: { fontSize: 9, color: '#e65100' },
  hint: {
    marginHorizontal: 12,
    marginTop: 14,
    backgroundColor: COLORS.tealFade,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
    borderRadius: 8,
    padding: 10,
  },
  hintTitle: { fontSize: 10, color: COLORS.tealDark, fontWeight: '700', marginBottom: 3 },
  hintText: { fontSize: 11, color: '#004d44', lineHeight: 16 },
  hint2: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  hint2Title: { fontSize: 10, color: COLORS.muted, fontWeight: '700', marginBottom: 3 },
  hint2Text: { fontSize: 10, color: COLORS.muted, lineHeight: 16 },
});
