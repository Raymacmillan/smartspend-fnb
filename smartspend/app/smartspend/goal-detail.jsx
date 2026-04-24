import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import { calculateGoal } from '../../src/services/goals/calculator';
import { formatPulaShort } from '../../src/utils/currency';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function GoalDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state } = useStore();
  const goal = state.goals.find((g) => g.id === parseInt(id));
  if (!goal) return null;

  const { monthsRemaining, amountNeeded, requiredMonthly, percentComplete } = calculateGoal(goal);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Goals</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{goal.name}</Text>
        <Text style={styles.subtitle}>Deadline: {goal.deadline}</Text>
      </View>

      <ScrollView>
        <View style={styles.hero}>
          <Text style={styles.heroName}>{goal.name}</Text>
          <Text style={styles.heroSub}>Deadline: {goal.deadline} · {monthsRemaining} months remaining</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percentComplete}%` }]} />
          </View>
          <Text style={styles.heroPct}>
            {formatPulaShort(goal.saved)} saved of {formatPulaShort(goal.target)} ({percentComplete}%)
          </Text>
        </View>

        <View style={styles.grid}>
          <StatBox value={formatPulaShort(goal.saved)} label="Amount saved" color={COLORS.green} />
          <StatBox value={formatPulaShort(amountNeeded)} label="Still needed" color={COLORS.red} />
          <StatBox value={formatPulaShort(requiredMonthly)} label="Required/month" />
          <StatBox value={`${monthsRemaining} months`} label="Time left" />
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Saving target insight</Text>
          <Text style={styles.hintText}>
            You need to save {formatPulaShort(requiredMonthly)}/month to reach your goal.
            {percentComplete < 30
              ? ' You are behind — consider reducing dining and ATM costs.'
              : ' You are on track. Keep it up!'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push({ pathname: '/smartspend/add-goal', params: { id: goal.id } })}
        >
          <Text style={styles.ctaTxt}>Edit Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cta, styles.ctaDark]} onPress={() => router.push('/smartspend/goals')}>
          <Text style={styles.ctaTxt}>Back to Goals</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

function StatBox({ value, label, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statN, color && { color }]}>{value}</Text>
      <Text style={styles.statD}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },
  hero: {
    marginHorizontal: 12,
    marginVertical: 12,
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    padding: 16,
  },
  heroName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 4 },
  track: { height: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 5, marginVertical: 12 },
  fill: { height: 10, borderRadius: 5, backgroundColor: '#fff' },
  heroPct: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 7,
  },
  stat: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statN: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  statD: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  hint: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: COLORS.orangeFade,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    borderRadius: 8,
    padding: 10,
  },
  hintTitle: { fontSize: 10, color: COLORS.orangeDark, fontWeight: '700', marginBottom: 3 },
  hintText: { fontSize: 11, color: '#6d3c00' },
  cta: {
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  ctaDark: { backgroundColor: COLORS.black },
  ctaTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
});