import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useGoals } from '../../src/hooks/useGoals';
import { seedUserData } from '../../src/services/firebase/seed';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import { percentChange } from '../../src/utils/math';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import { calculateGoal } from '../../src/services/goals/calculator';
import CategoryRow from '../../src/components/overview/CategoryRow';
import InsightCard from '../../src/components/overview/InsightCard';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function SmartSpendOverview() {
  const router = useRouter();
  const { state, dispatch, user } = useStore();
  const { currentMonth } = state;
  const { transactions, loading, refetch } = useTransactions(user?.uid);
  const { goals } = useGoals(user?.uid);

  const m = transactions[currentMonth];
  const prev = currentMonth === 'mar' ? transactions.feb : null;

  const handleSeed = async () => {
    try {
      const result = await seedUserData(user.uid, user.email);
      Alert.alert('Data seeded', `Added ${result.transactionsSeeded} transactions.`);
      await refetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.teal} size="large" />
      </SafeAreaView>
    );
  }

  // No data yet — offer to seed
  if (!m) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySub}>Seed demo data to explore SmartSpend.</Text>
        <TouchableOpacity style={styles.seedBtn} onPress={handleSeed}>
          <Text style={styles.seedBtnTxt}>Seed Demo Data</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const diff = prev ? percentChange(m.total, prev.total) : 0;
  const recommendations = generateRecommendations(m.categories);
  const totalSaving = recommendations.reduce((sum, r) => sum + r.savingRaw, 0);
  const firstGoal = goals[0];
  const goalData = firstGoal ? calculateGoal(firstGoal) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ FNB Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Smart Spend Analytics</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.monthBar}>
        <Text style={styles.monthLbl}>Month:</Text>
        <TouchableOpacity
          style={styles.monthBtn}
          onPress={() => dispatch({ type: 'SET_MONTH', payload: currentMonth === 'mar' ? 'feb' : 'mar' })}
        >
          <Text style={styles.monthTxt}>{m.label} ▼</Text>
        </TouchableOpacity>
        {prev && (
          <View style={[styles.cmpBadge, diff > 0 && styles.cmpBadgeUp]}>
            <Text style={[styles.cmpBadgeTxt, diff > 0 && styles.cmpBadgeTxtUp]}>
              {diff > 0 ? '▲ +' : '▼ '}{Math.abs(diff).toFixed(1)}% vs last month
            </Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.totalSec}>
          <Text style={styles.totalBig}>{formatPula(m.total)}</Text>
          <Text style={styles.totalSm}>Total spent · {m.label}</Text>
        </View>

        <View style={styles.section}>
          {m.categories.map((cat, idx) => (
            <CategoryRow
              key={cat.key}
              category={cat}
              total={m.total}
              onPress={() => router.push({ pathname: '/smartspend/category', params: { idx } })}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Explore your finances</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <InsightCard
              icon="✓"
              title="Recommendations"
              value={`P ${Math.round(totalSaving)}`}
              valueColor={COLORS.orange}
              subtitle="potential saving/month"
              onPress={() => router.push('/smartspend/recommendations')}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="❤️"
              title="Health Score"
              value="68/100"
              valueColor={COLORS.teal}
              subtitle="average · up 4 pts"
              onPress={() => router.push('/smartspend/health-score')}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="🎯"
              title="Goal Saving"
              value={goalData ? `${goalData.percentComplete}%` : '—'}
              valueColor={COLORS.blue}
              subtitle={firstGoal ? `${firstGoal.name} · ${formatPulaShort(firstGoal.saved)} saved` : 'No goals set'}
              onPress={() => router.push('/smartspend/goals')}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="💳"
              title="Bank Charges"
              value={formatPulaShort(m.categories.find((c) => c.key === 'bankCharges')?.amount || 0)}
              valueColor={COLORS.red}
              subtitle="this month · up P14"
              onPress={() => router.push('/smartspend/charges')}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 11, color: COLORS.muted, marginBottom: 20 },
  seedBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
  },
  seedBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
  },
  monthLbl: { fontSize: 10, color: COLORS.muted },
  monthBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
  },
  monthTxt: { fontSize: 11, color: COLORS.text },
  cmpBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.tealFade,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  cmpBadgeUp: { backgroundColor: '#fce4ec' },
  cmpBadgeTxt: { fontSize: 9, color: COLORS.tealDark, fontWeight: '600' },
  cmpBadgeTxtUp: { color: '#b71c1c' },
  totalSec: { alignItems: 'center', paddingVertical: 14 },
  totalBig: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  totalSm: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  section: { backgroundColor: COLORS.white },
  sectionLabel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 14,
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  gridItem: { width: '48%' },
});