import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { MONTHS_ORDER } from '../../src/data/sampleTransactions';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import { percentChange } from '../../src/utils/math';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import { calculateGoal } from '../../src/services/goals/calculator';
import { calculateHealthScore } from '../../src/services/health/scorer';
import CategoryRow from '../../src/components/overview/CategoryRow';
import DonutChart from '../../src/components/overview/DonutChart';
import InsightCard from '../../src/components/overview/InsightCard';
import MonthSwitcher from '../../src/components/overview/MonthSwitcher';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function SmartSpendOverview() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { currentMonth, transactions, goals, user } = state;

  const m = transactions[currentMonth];
  const monthIdx = MONTHS_ORDER.indexOf(currentMonth);
  const prevKey = MONTHS_ORDER[monthIdx - 1] || null;
  const prev = prevKey ? transactions[prevKey] : null;
  const diff = prev ? percentChange(m.total, prev.total) : null;

  // Computed health score
  const healthScore = calculateHealthScore({
    categories: m.categories,
    total: m.total,
    goals,
    prevTotal: prev?.total,
  });
  const prevHealthScore = prev
    ? calculateHealthScore({ categories: prev.categories, total: prev.total, goals, prevTotal: null })
    : null;
  const scoreDiff = prevHealthScore !== null ? healthScore.total - prevHealthScore.total : null;

  const recommendations = generateRecommendations(m.categories);
  const totalSaving = recommendations.reduce((sum, r) => sum + r.savingRaw, 0);

  const firstGoal = goals[0];
  const goalData = firstGoal ? calculateGoal(firstGoal) : null;

  const chargesCat = m.categories.find((c) => c.key === 'bankCharges');
  const prevChargesCat = prev?.categories.find((c) => c.key === 'bankCharges');
  const chargeDiff = chargesCat && prevChargesCat
    ? Math.round(chargesCat.amount - prevChargesCat.amount)
    : null;

  const goToPrev = () => dispatch({ type: 'SET_MONTH', payload: MONTHS_ORDER[monthIdx - 1] });
  const goToNext = () => dispatch({ type: 'SET_MONTH', payload: MONTHS_ORDER[monthIdx + 1] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ FNB Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Smart Spend Analytics</Text>
        <Text style={styles.subtitle}>{user.name} · {user.account}</Text>
      </View>

      <MonthSwitcher
        label={m.label}
        onPrev={goToPrev}
        onNext={goToNext}
        hasPrev={monthIdx > 0}
        hasNext={monthIdx < MONTHS_ORDER.length - 1}
        diff={diff}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.totalSec}>
          <Text style={styles.totalBig}>{formatPula(m.total)}</Text>
          <Text style={styles.totalSm}>Total spent · {m.label}</Text>
        </View>

        <DonutChart categories={m.categories} total={m.total} />

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
              value={`${healthScore.total}/100`}
              valueColor={healthScore.total >= 75 ? COLORS.teal : healthScore.total >= 50 ? COLORS.orange : COLORS.red}
              subtitle={
                scoreDiff !== null
                  ? `${scoreDiff > 0 ? '▲ +' : '▼ '}${Math.abs(scoreDiff)} pts vs last month`
                  : 'your financial health'
              }
              onPress={() => router.push('/smartspend/health-score')}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="🎯"
              title="Goal Saving"
              value={goalData ? `${goalData.percentComplete}%` : '—'}
              valueColor={COLORS.blue}
              subtitle={
                firstGoal
                  ? `${firstGoal.name} · ${formatPulaShort(firstGoal.saved)} saved`
                  : 'No goals set'
              }
              onPress={() => router.push('/smartspend/goals')}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="💳"
              title="Bank Charges"
              value={formatPulaShort(chargesCat?.amount || 0)}
              valueColor={COLORS.red}
              subtitle={
                chargeDiff !== null
                  ? `this month · ${chargeDiff > 0 ? `▲ +P${chargeDiff}` : `▼ −P${Math.abs(chargeDiff)}`}`
                  : 'this month'
              }
              onPress={() => router.push('/smartspend/charges')}
            />
          </View>
        </View>

        {/* Impact & Business Model link */}
        <TouchableOpacity
          style={styles.impactBanner}
          onPress={() => router.push('/smartspend/impact')}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.impactTitle}>🌍 SmartSpend Impact & Vision</Text>
            <Text style={styles.impactSub}>
              See the business model, market opportunity, and how SmartSpend is transforming financial health in Botswana →
            </Text>
          </View>
        </TouchableOpacity>

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
  totalSec: { alignItems: 'center', paddingVertical: 14 },
  totalBig: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  totalSm: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  section: { backgroundColor: COLORS.white, marginBottom: 4 },
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
  impactBanner: {
    marginHorizontal: 12,
    marginTop: 14,
    backgroundColor: COLORS.black,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  impactTitle: { color: '#fff', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  impactSub: { color: '#aaa', fontSize: 10, lineHeight: 15 },
});
