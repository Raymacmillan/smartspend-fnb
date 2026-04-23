import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { calculateGoal } from '../../src/services/goals/calculator';
import { formatPulaShort } from '../../src/utils/currency';
import THEME from '../../src/constants/theme';

export default function Goals() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { goals } = state;

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Goal-Based Saving</Text>
        <Text style={styles.sub}>Track your savings targets</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={styles.summaryValue}>{formatPulaShort(totalSaved)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summaryLabel}>Total Target</Text>
              <Text style={styles.summaryValue}>{formatPulaShort(totalTarget)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summaryLabel}>Overall</Text>
              <Text style={[styles.summaryValue, { color: THEME.primary }]}>{overallPct}%</Text>
            </View>
          </View>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${overallPct}%` }]} />
          </View>
        </View>

        {/* Goal cards */}
        {goals.map((g) => {
          const { amountNeeded, requiredMonthly, percentComplete, onTrack } = calculateGoal(g);
          return (
            <TouchableOpacity
              key={g.id}
              style={styles.goalCard}
              onPress={() => router.push({ pathname: '/goal-detail', params: { id: g.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalName}>{g.name}</Text>
                  <Text style={styles.goalDeadline}>📅 {g.deadline}</Text>
                </View>
                <View style={[styles.trackBadge, { backgroundColor: onTrack ? THEME.successFade : THEME.dangerFade }]}>
                  <Text style={[styles.trackBadgeTxt, { color: onTrack ? THEME.success : THEME.danger }]}>
                    {onTrack ? 'On track' : 'Behind'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percentComplete}%` }]} />
              </View>
              <Text style={styles.progressTxt}>{percentComplete}% complete · {formatPulaShort(g.saved)} of {formatPulaShort(g.target)}</Text>

              <View style={styles.goalStats}>
                <MiniStat label="Still needed" value={formatPulaShort(amountNeeded)} color={THEME.danger} />
                <MiniStat label="Required/month" value={formatPulaShort(requiredMonthly)} />
              </View>

              <View style={styles.goalActions}>
                <TouchableOpacity style={styles.goalBtn} onPress={() => router.push({ pathname: '/goal-detail', params: { id: g.id } })}>
                  <Text style={styles.goalBtnTxt}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.goalBtn, styles.goalBtnOutline]} onPress={() => router.push({ pathname: '/add-goal', params: { id: g.id } })}>
                  <Text style={styles.goalBtnOutlineTxt}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.goalBtn, styles.goalBtnDanger]} onPress={() => dispatch({ type: 'DELETE_GOAL', payload: g.id })}>
                  <Text style={styles.goalBtnDangerTxt}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTxt}>No goals yet. Add your first savings goal.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-goal')}>
          <Text style={styles.addBtnTxt}>+ Add New Goal</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={[styles.miniStatValue, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 11, marginTop: 2 },
  scroll: { padding: 12, gap: 12 },
  summaryCard: { backgroundColor: THEME.dark, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#ffffff10' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#ffffff20', marginHorizontal: 12 },
  summaryLabel: { color: THEME.textLight, fontSize: 10, marginBottom: 2 },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  overallTrack: { height: 6, backgroundColor: '#ffffff20', borderRadius: 3 },
  overallFill: { height: 6, backgroundColor: THEME.primary, borderRadius: 3 },
  goalCard: { backgroundColor: THEME.card, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  goalName: { fontSize: 15, fontWeight: '800', color: THEME.text },
  goalDeadline: { fontSize: 10, color: THEME.textSub, marginTop: 2 },
  trackBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  trackBadgeTxt: { fontSize: 10, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: THEME.border, marginHorizontal: 14, borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: THEME.primary, borderRadius: 4 },
  progressTxt: { fontSize: 10, color: THEME.textSub, paddingHorizontal: 14, marginTop: 4 },
  goalStats: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 8 },
  miniStat: { flex: 1, backgroundColor: THEME.bg, borderRadius: 8, padding: 8 },
  miniStatLabel: { fontSize: 9, color: THEME.textSub },
  miniStatValue: { fontSize: 13, fontWeight: '800', color: THEME.text, marginTop: 2 },
  goalActions: { flexDirection: 'row', gap: 6, padding: 12, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  goalBtn: { flex: 1, backgroundColor: THEME.primary, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  goalBtnTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  goalBtnOutline: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border },
  goalBtnOutlineTxt: { color: THEME.text, fontSize: 11, fontWeight: '700' },
  goalBtnDanger: { backgroundColor: THEME.dangerFade, borderWidth: 1, borderColor: '#fca5a5' },
  goalBtnDangerTxt: { color: THEME.danger, fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt: { fontSize: 13, color: THEME.textSub, textAlign: 'center' },
  addBtn: { backgroundColor: THEME.card, borderWidth: 1.5, borderColor: THEME.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderStyle: 'dashed' },
  addBtnTxt: { color: THEME.primary, fontSize: 13, fontWeight: '700' },
});
