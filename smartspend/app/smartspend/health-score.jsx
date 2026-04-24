import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { calculateHealthScore } from '../../src/services/health/scorer';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function HealthScore() {
  const router = useRouter();
  const { state } = useStore();
  const m = state.transactions[state.currentMonth];
  const prev = state.transactions.feb;

  const score = calculateHealthScore({
    categories: m.categories,
    total: m.total,
    goals: state.goals,
    prevTotal: prev ? prev.total : null,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Financial Health Score</Text>
        <Text style={styles.subtitle}>{m.label}</Text>
      </View>

      <ScrollView>
        <View style={styles.scoreWrap}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>{score.total}</Text>
            <Text style={styles.scoreLabel}>out of 100</Text>
          </View>
          <Text style={styles.scoreStatus}>
            {score.total >= 80 ? 'Excellent' : score.total >= 60 ? 'Average — room to improve' : 'Needs improvement'}
          </Text>
          <Text style={styles.scoreSub}>Up 4 points from February (score: 64)</Text>
        </View>

        <Text style={styles.sectionLabel}>Score breakdown</Text>
        <View style={styles.breakdown}>
          {Object.values(score.breakdown).map((f) => (
            <View key={f.label} style={styles.sbRow}>
              <Text style={styles.sbLbl}>{f.label}</Text>
              <View style={styles.sbTrack}>
                <View
                  style={[
                    styles.sbFill,
                    {
                      width: `${(f.score / f.max) * 100}%`,
                      backgroundColor: f.score / f.max >= 0.6 ? COLORS.teal : COLORS.orange,
                    },
                  ]}
                />
              </View>
              <Text style={styles.sbPts}>{f.score}/{f.max}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tagsSec}>
          <Text style={styles.tagsLabel}>What helped (vs Feb)</Text>
          <View style={styles.tagRow}>
            {score.helped.map((t) => (
              <View key={t} style={[styles.tag, styles.tagGood]}>
                <Text style={styles.tagGoodTxt}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.tagsLabel}>What hurt (vs Feb)</Text>
          <View style={styles.tagRow}>
            {score.hurt.map((t) => (
              <View key={t} style={[styles.tag, styles.tagBad]}>
                <Text style={styles.tagBadTxt}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Top action</Text>
          <Text style={styles.hintText}>{score.topAction}</Text>
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
  scoreWrap: { alignItems: 'center', padding: 20 },
  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 11,
    borderColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: { fontSize: 34, fontWeight: '800', color: COLORS.teal },
  scoreLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  scoreStatus: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  scoreSub: { fontSize: 10, color: COLORS.muted, marginTop: 4 },
  sectionLabel: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
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
    paddingVertical: 8,
  },
  sbRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 12 },
  sbLbl: { fontSize: 10, color: COLORS.text, width: 110 },
  sbTrack: { flex: 1, height: 5, backgroundColor: '#eee', borderRadius: 3 },
  sbFill: { height: 5, borderRadius: 3 },
  sbPts: { fontSize: 10, color: COLORS.muted, width: 32, textAlign: 'right' },
  tagsSec: { paddingHorizontal: 14, paddingTop: 12 },
  tagsLabel: { fontSize: 10, color: COLORS.muted, marginBottom: 6, marginTop: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, marginBottom: 4 },
  tagGood: { backgroundColor: '#e8f5e9' },
  tagBad: { backgroundColor: COLORS.orangeFade },
  tagGoodTxt: { fontSize: 9, color: '#2e7d32' },
  tagBadTxt: { fontSize: 9, color: '#e65100' },
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
});