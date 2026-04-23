import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { MONTHS_ORDER } from '../../src/data/sampleTransactions';
import { calculateHealthScore } from '../../src/services/health/scorer';
import ScoreRing from '../../src/components/health/ScoreRing';
import ScoreBar from '../../src/components/health/ScoreBar';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function HealthScore() {
  const router = useRouter();
  const { state } = useStore();
  const { currentMonth, transactions, goals } = state;
  const m = transactions[currentMonth];

  const monthIdx = MONTHS_ORDER.indexOf(currentMonth);
  const prevKey = MONTHS_ORDER[monthIdx - 1] || null;
  const prev = prevKey ? transactions[prevKey] : null;

  const score = calculateHealthScore({
    categories: m.categories,
    total: m.total,
    goals,
    prevTotal: prev?.total,
  });

  const prevScore = prev
    ? calculateHealthScore({ categories: prev.categories, total: prev.total, goals, prevTotal: null })
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
        <Text style={styles.subtitle}>{m.label}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scoreWrap}>
          <ScoreRing score={score.total} size={140} />
          <Text style={styles.scoreStatus}>{statusLabel}</Text>
          {scoreDiff !== null && (
            <Text style={[styles.scoreSub, { color: scoreDiff >= 0 ? COLORS.teal : COLORS.red }]}>
              {scoreDiff >= 0 ? '▲ +' : '▼ '}
              {Math.abs(scoreDiff)} points vs {prev ? transactions[prevKey].label : 'last month'}
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
            {prev ? `What helped vs ${transactions[prevKey].label}` : 'Positive factors'}
          </Text>
          <View style={styles.tagRow}>
            {score.helped.map((t) => (
              <View key={t} style={[styles.tag, styles.tagGood]}>
                <Text style={styles.tagGoodTxt}>✓ {t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.tagsLabel}>
            {prev ? `What hurt vs ${transactions[prevKey].label}` : 'Areas to improve'}
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
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },
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
