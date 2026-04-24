import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { calculateGoal } from '../../src/services/goals/calculator';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import THEME from '../../src/constants/theme';
import { subscribeToUserGoals } from '../../src/services/firebase/db';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../src/services/firebase/config';

export default function GoalDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (auth?.currentUser) return subscribeToUserGoals(setGoals);
  }, []);

  const goal = goals.find((g) => String(g.id) === String(id));

  if (!goal) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTxt}>Goal not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { amountNeeded, requiredMonthly, percentComplete, onTrack, monthsRemaining } = calculateGoal(goal);

  const handleDelete = async () => {
    await deleteDoc(doc(db, `users/${auth.currentUser.uid}/goals`, String(goal.id)));
    router.back();
  };

  const milestones = [25, 50, 75, 100].map((pct) => ({
    pct,
    amount: Math.round((goal.target * pct) / 100),
    reached: percentComplete >= pct,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{goal.name}</Text>
          <Text style={styles.sub}>📅 {goal.deadline}</Text>
        </View>
        <View style={[styles.trackBadge, { backgroundColor: onTrack ? THEME.successFade : THEME.dangerFade }]}>
          <Text style={[styles.trackTxt, { color: onTrack ? THEME.success : THEME.danger }]}>
            {onTrack ? '✓ On track' : '⚠ Behind'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressAmt}>
            <View>
              <Text style={styles.savedLabel}>Saved</Text>
              <Text style={styles.savedAmt}>{formatPula(goal.saved)}</Text>
            </View>
            <Text style={styles.ofTxt}>of</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.savedLabel}>Target</Text>
              <Text style={styles.targetAmt}>{formatPula(goal.target)}</Text>
            </View>
          </View>
          <View style={styles.bigTrack}>
            <View style={[styles.bigFill, { width: `${percentComplete}%` }]} />
            <Text style={styles.bigPct}>{percentComplete}%</Text>
          </View>
          <Text style={styles.progressNote}>{formatPulaShort(amountNeeded)} still needed</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{monthsRemaining}</Text>
            <Text style={styles.statLabel}>Months left</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{formatPulaShort(requiredMonthly)}</Text>
            <Text style={styles.statLabel}>Needed/month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>{onTrack ? '🟢' : '🔴'}</Text>
            <Text style={[styles.statValue, { color: onTrack ? THEME.success : THEME.danger }]}>
              {onTrack ? 'On track' : 'Behind'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Milestones</Text>
          {milestones.map((ms) => (
            <View key={ms.pct} style={styles.milestoneRow}>
              <View style={[styles.milestoneDot, ms.reached && styles.milestoneDotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.milestoneTxt, ms.reached && styles.milestoneDoneTxt]}>
                  {ms.pct}% — {formatPulaShort(ms.amount)}
                </Text>
              </View>
              {ms.reached ? (
                <Text style={styles.milestoneCheck}>✓</Text>
              ) : (
                <Text style={styles.milestoneLeft}>{formatPulaShort(ms.amount - goal.saved > 0 ? ms.amount - goal.saved : 0)} to go</Text>
              )}
            </View>
          ))}
        </View>

        {/* Insight */}
        <View style={[styles.insightBox, { borderLeftColor: onTrack ? THEME.success : THEME.warning }]}>
          <Text style={styles.insightTitle}>{onTrack ? '💡 Keep it up!' : '💡 You\'re behind'}</Text>
          <Text style={styles.insightTxt}>
            {onTrack
              ? `You're on pace to reach your ${goal.name} goal by ${goal.deadline}. Save at least ${formatPulaShort(requiredMonthly)}/month to stay on track.`
              : `To reach ${goal.name} by ${goal.deadline}, you need to save ${formatPulaShort(requiredMonthly)}/month over the next ${monthsRemaining} months. Consider reducing discretionary spending.`
            }
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push({ pathname: '/smartspend/add-goal', params: { id: goal.id } })}
          >
            <Text style={styles.editBtnTxt}>✏️ Edit Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnTxt}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.advisory}>
          <Text style={styles.advisoryTxt}>⚖️ Savings projections are estimates. Advisory only — not regulated financial advice.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  backBtn: { padding: 16 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 10, marginTop: 2 },
  trackBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, marginTop: 4 },
  trackTxt: { fontSize: 10, fontWeight: '700' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundTxt: { fontSize: 14, color: THEME.textSub },
  scroll: { padding: 14, gap: 12 },
  progressCard: { backgroundColor: THEME.dark, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#ffffff10' },
  progressAmt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  savedLabel: { color: THEME.textLight, fontSize: 10, marginBottom: 2 },
  savedAmt: { color: THEME.primary, fontSize: 28, fontWeight: '900' },
  ofTxt: { color: THEME.textLight, fontSize: 12 },
  targetAmt: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bigTrack: { height: 16, backgroundColor: '#ffffff20', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  bigFill: { height: 16, backgroundColor: THEME.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 },
  bigPct: { color: '#fff', fontSize: 9, fontWeight: '800' },
  progressNote: { color: THEME.textLight, fontSize: 10 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: THEME.card, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800', color: THEME.text, textAlign: 'center' },
  statLabel: { fontSize: 9, color: THEME.textSub, textAlign: 'center' },
  card: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, marginBottom: 10 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  milestoneDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: THEME.border, borderWidth: 2, borderColor: THEME.border },
  milestoneDotDone: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  milestoneTxt: { fontSize: 12, color: THEME.textSub },
  milestoneDoneTxt: { color: THEME.text, fontWeight: '600' },
  milestoneCheck: { fontSize: 14, color: THEME.success, fontWeight: '700' },
  milestoneLeft: { fontSize: 10, color: THEME.textSub },
  insightBox: { backgroundColor: THEME.card, borderRadius: 12, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  insightTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, marginBottom: 6 },
  insightTxt: { fontSize: 11, color: THEME.textSub, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  deleteBtn: { flex: 1, backgroundColor: THEME.dangerFade, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  deleteBtnTxt: { color: THEME.danger, fontSize: 13, fontWeight: '700' },
  advisory: { backgroundColor: THEME.warningFade, borderRadius: 10, padding: 12 },
  advisoryTxt: { fontSize: 10, color: THEME.warning, lineHeight: 15 },
});