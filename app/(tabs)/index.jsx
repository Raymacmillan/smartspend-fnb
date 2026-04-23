import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { MONTHS_ORDER } from '../../src/data/sampleTransactions';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import { percentChange } from '../../src/utils/math';
import { calculateHealthScore } from '../../src/services/health/scorer';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import { calculateGoal } from '../../src/services/goals/calculator';
import DonutChart from '../../src/components/overview/DonutChart';
import THEME from '../../src/constants/theme';

export default function Dashboard() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { currentMonth, transactions, goals, user, notifications } = state;

  const m = transactions[currentMonth];
  const idx = MONTHS_ORDER.indexOf(currentMonth);
  const prevKey = MONTHS_ORDER[idx - 1] || null;
  const prev = prevKey ? transactions[prevKey] : null;
  const diff = prev ? percentChange(m.total, prev.total) : null;

  const health = calculateHealthScore({ categories: m.categories, total: m.total, goals, prevTotal: prev?.total });
  const recs = generateRecommendations(m.categories).slice(0, 2);
  const totalSaving = generateRecommendations(m.categories).reduce((s, r) => s + r.savingRaw, 0);
  const unread = notifications.filter((n) => !n.read).length;
  const allGoalPct = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.saved / g.target) * 100, 0) / goals.length)
    : 0;

  const goToPrev = () => idx > 0 && dispatch({ type: 'SET_MONTH', payload: MONTHS_ORDER[idx - 1] });
  const goToNext = () => idx < MONTHS_ORDER.length - 1 && dispatch({ type: 'SET_MONTH', payload: MONTHS_ORDER[idx + 1] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTxt}>📊 SmartSpend</Text>
          <Text style={styles.greeting}>Good morning, {user.name} 👋</Text>
        </View>
        <TouchableOpacity style={styles.bellWrap} onPress={() => router.push('/notifications')}>
          <Text style={styles.bell}>🔔</Text>
          {unread > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeTxt}>{unread}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Spending card */}
        <View style={styles.spendCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={goToPrev} style={[styles.navBtn, idx === 0 && styles.navBtnDisabled]}>
              <Text style={styles.navBtnTxt}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLbl}>{m.label}</Text>
            <TouchableOpacity onPress={goToNext} style={[styles.navBtn, idx === MONTHS_ORDER.length - 1 && styles.navBtnDisabled]}>
              <Text style={styles.navBtnTxt}>›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.spendLabel}>Total Spent</Text>
          <Text style={styles.spendAmt}>{formatPula(m.total)}</Text>
          {diff !== null && (
            <Text style={[styles.spendDiff, { color: diff > 0 ? THEME.danger : THEME.success }]}>
              {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}% vs {prev ? transactions[prevKey].label : 'last month'}
            </Text>
          )}
          {/* Budget bar */}
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLbl}>Monthly Budget: P5,000</Text>
            <Text style={styles.budgetPct}>{Math.min(100, Math.round((m.total / 5000) * 100))}%</Text>
          </View>
          <View style={styles.budgetTrack}>
            <View style={[styles.budgetFill, {
              width: `${Math.min(100, Math.round((m.total / 5000) * 100))}%`,
              backgroundColor: m.total > 5000 ? THEME.danger : THEME.primary,
            }]} />
          </View>
          <Text style={styles.accountLbl}>{user.account} · {user.tier}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatTile
            value={`${health.total}`}
            label="Health Score"
            color={health.total >= 70 ? THEME.success : health.total >= 50 ? THEME.warning : THEME.danger}
            onPress={() => router.push('/analytics')}
          />
          <StatTile
            value={`P${Math.round(totalSaving)}`}
            label="Save/month"
            color={THEME.warning}
            onPress={() => router.push('/recommendations')}
          />
          <StatTile
            value={`${allGoalPct}%`}
            label="Goal avg"
            color={THEME.info}
            onPress={() => router.push('/(tabs)/goals')}
          />
          <StatTile
            value={unread > 0 ? `${unread}` : '✓'}
            label="Alerts"
            color={unread > 0 ? THEME.danger : THEME.success}
            onPress={() => router.push('/notifications')}
          />
        </View>

        {/* Spending breakdown */}
        <View style={styles.section}>
          <SectionHeader title="Spending Breakdown" onPress={() => router.push('/analytics')} />
          <DonutChart categories={m.categories} total={m.total} />
          <View style={styles.catList}>
            {m.categories.map((cat, i) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.catRow}
                onPress={() => router.push({ pathname: '/category', params: { idx: i } })}
                activeOpacity={0.7}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.emoji} {cat.name}</Text>
                <View style={styles.catBar}>
                  <View style={[styles.catFill, { width: `${Math.round((cat.amount / m.total) * 100)}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catAmt}>{formatPulaShort(cat.amount)}</Text>
                <Text style={styles.catArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        {recs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Smart Recommendations" onPress={() => router.push('/recommendations')} />
            {recs.map((rec) => (
              <TouchableOpacity key={rec.id} style={styles.recCard} onPress={() => router.push('/recommendations')} activeOpacity={0.85}>
                <View style={[styles.recSeverity, { backgroundColor: rec.severity === 'high' ? THEME.dangerFade : THEME.warningFade }]}>
                  <Text style={[styles.recSeverityTxt, { color: rec.severity === 'high' ? THEME.danger : THEME.warning }]}>
                    {rec.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                  </Text>
                </View>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recSub}>{rec.subtitle}</Text>
                <Text style={styles.recSave}>💰 Save {rec.saving}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/recommendations')}>
              <Text style={styles.seeAllTxt}>See all recommendations →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security notice */}
        <TouchableOpacity style={styles.secNotice} onPress={() => router.push('/security')} activeOpacity={0.85}>
          <Text style={styles.secNoticeIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.secNoticeTitle}>Advisory notice · Not regulated financial advice</Text>
            <Text style={styles.secNoticeSub}>Tap to view your Security & Privacy Centre →</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ value, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.statTile} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress}><Text style={styles.sectionMore}>See all →</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    backgroundColor: THEME.dark, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  brandTxt: { color: THEME.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  greeting: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  bellWrap: { position: 'relative', padding: 4 },
  bell: { fontSize: 22 },
  bellBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: THEME.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  bellBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  scroll: { padding: 12, gap: 12 },
  spendCard: { backgroundColor: THEME.dark, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#ffffff10' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.2 },
  navBtnTxt: { color: '#fff', fontSize: 18, lineHeight: 22 },
  monthLbl: { color: THEME.textLight, fontSize: 12, fontWeight: '600' },
  spendLabel: { color: THEME.textLight, fontSize: 11 },
  spendAmt: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 4 },
  spendDiff: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  budgetLbl: { color: THEME.textLight, fontSize: 10 },
  budgetPct: { color: THEME.textLight, fontSize: 10 },
  budgetTrack: { height: 6, backgroundColor: '#ffffff20', borderRadius: 3, marginBottom: 10 },
  budgetFill: { height: 6, borderRadius: 3 },
  accountLbl: { color: '#555', fontSize: 9 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statTile: { flex: 1, backgroundColor: THEME.card, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4, shadowColor: THEME.shadow, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 9, color: THEME.textSub, textAlign: 'center' },
  section: { backgroundColor: THEME.card, borderRadius: 14, overflow: 'hidden', shadowColor: THEME.shadow, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: THEME.text },
  sectionMore: { fontSize: 11, color: THEME.primary },
  catList: { paddingBottom: 4 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 11, color: THEME.text },
  catBar: { width: 44, height: 4, backgroundColor: THEME.border, borderRadius: 2 },
  catFill: { height: 4, borderRadius: 2 },
  catAmt: { fontSize: 11, fontWeight: '700', color: THEME.text, minWidth: 44, textAlign: 'right' },
  catArrow: { color: THEME.textLight, fontSize: 12 },
  recCard: { marginHorizontal: 12, marginBottom: 8, backgroundColor: THEME.bg, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: THEME.warning },
  recSeverity: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  recSeverityTxt: { fontSize: 9, fontWeight: '800' },
  recTitle: { fontSize: 12, fontWeight: '700', color: THEME.text },
  recSub: { fontSize: 10, color: THEME.textSub, marginTop: 2 },
  recSave: { fontSize: 11, color: THEME.success, fontWeight: '700', marginTop: 4 },
  seeAll: { padding: 12, alignItems: 'center', borderTopWidth: 0.5, borderTopColor: THEME.divider },
  seeAllTxt: { fontSize: 11, color: THEME.primary, fontWeight: '600' },
  secNotice: {
    backgroundColor: THEME.dark, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#ffffff10',
  },
  secNoticeIcon: { fontSize: 20 },
  secNoticeTitle: { color: THEME.warning, fontSize: 11, fontWeight: '700' },
  secNoticeSub: { color: '#555', fontSize: 10, marginTop: 2 },
});
