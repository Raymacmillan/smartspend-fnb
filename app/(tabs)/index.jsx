import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { formatPula, formatPulaShort } from '../../src/utils/currency';
import { percentChange } from '../../src/utils/math';
import { calculateHealthScore } from '../../src/services/health/scorer';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import { calculateGoal } from '../../src/services/goals/calculator';
import DonutChart from '../../src/components/overview/DonutChart';
import THEME from '../../src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, collection, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../src/services/firebase/config';
import { subscribeToUserTransactions, subscribeToUserGoals } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';
import { subMonths, addMonths, startOfMonth } from 'date-fns';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const router = useRouter();
  const { state } = useStore();
  const { user, notifications } = state;

  const [realName, setRealName] = useState(user?.name || 'User');
  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState('5000');
  const [targetDate, setTargetDate] = useState(startOfMonth(new Date()));
  const [rawTxs, setRawTxs] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (auth?.currentUser) {
      getDoc(doc(db, 'users', auth.currentUser.uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setRealName(data.name);
          if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
        }
      });
      const unsubTxs = subscribeToUserTransactions(setRawTxs);
      const unsubGoals = subscribeToUserGoals(setGoals);
      return () => { unsubTxs(); unsubGoals(); };
    }
  }, []);

  // Create a mathematical signature of the categories to absolutely prevent React infinite loops
  const categoriesSignature = rawTxs 
    ? JSON.stringify(processTransactions(rawTxs, targetDate).categories.map(c => ({ key: c.key, amount: c.amount, count: c.transactions?.length })))
    : '';

  useEffect(() => {
    async function fetchRecs() {
      if (rawTxs) {
        const m = processTransactions(rawTxs, targetDate);
        if (m.categories && m.categories.length > 0) {
          try {
            const res = await generateRecommendations(m.categories);
            setRecommendations(res || []);
          } catch (e) {
            setRecommendations([]);
          }
        } else setRecommendations([]);
      }
    }
    fetchRecs();
  }, [categoriesSignature]);

  if (!rawTxs) return <SafeAreaView style={styles.container}><ActivityIndicator color={THEME.primary} style={{ marginTop: 50 }} /></SafeAreaView>;

  const m = processTransactions(rawTxs, targetDate);
  const diff = m.prevTotal ? percentChange(m.total, m.prevTotal) : null;

  const health = calculateHealthScore({ categories: m.categories, total: m.total, goals, prevTotal: m.prevTotal });
  const recs = recommendations.slice(0, 2);
  const totalSaving = recommendations.reduce((s, r) => s + r.savingRaw, 0);
  const unread = notifications.filter((n) => !n.read).length;
  const allGoalPct = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.saved / g.target) * 100, 0) / goals.length)
    : 0;

  const handleSimulateTx = async () => {
    const templates = [
      { desc: 'KFC GABORONE', min: 40, max: 150 },
      { desc: 'CHECKERS AIRPORT JUNCTION', min: 300, max: 1200 },
      { desc: 'ENGEN TSHOLOFELO', min: 150, max: 400 },
      { desc: 'ORANGE AIRTIME TOPUP', min: 10, max: 50 }
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const amt = Math.floor(Math.random() * (t.max - t.min + 1)) + t.min;
    await addDoc(collection(db, `users/${auth.currentUser.uid}/transactions`), {
      description: t.desc, amount: amt, date: Timestamp.now()
    });
    Alert.alert('Success', `Simulated transaction: P${amt} at ${t.desc}`);
  };

  const handleSaveBudget = async () => {
    const newB = Number(tempBudget);
    if (isNaN(newB) || newB <= 0) {
      Alert.alert('Invalid', 'Please enter a valid budget amount.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { monthlyBudget: newB });
      setMonthlyBudget(newB);
      setBudgetModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="chart-donut" size={22} color={THEME.primary} />
          <Text style={styles.brandTxt}>SmartSpend</Text>
        </View>
        <TouchableOpacity style={styles.bellWrap} onPress={() => router.push('/notifications')}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          {unread > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeTxt}>{unread}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Greeting Section */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTime}>{getGreeting()},</Text>
          <Text style={styles.greetingName}>{realName}</Text>
        </View>

        {/* Spending card */}
        <View style={styles.spendCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => setTargetDate(d => subMonths(d, 1))} style={styles.navBtn}>
              <Text style={styles.navBtnTxt}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLbl}>{m.label}</Text>
            <TouchableOpacity onPress={() => setTargetDate(d => addMonths(d, 1))} style={styles.navBtn}>
              <Text style={styles.navBtnTxt}>›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.spendLabel}>Total Spent</Text>
          <Text style={styles.spendAmt}>{formatPula(m.total)}</Text>
          {diff !== null && (
            <Text style={[styles.spendDiff, { color: diff > 0 ? THEME.danger : THEME.success }]}>
              {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}% vs last month
            </Text>
          )}
          {/* Budget bar */}
          <TouchableOpacity style={styles.budgetRow} onPress={() => { setTempBudget(String(monthlyBudget)); setBudgetModalVisible(true); }} activeOpacity={0.7}>
            <Text style={styles.budgetLbl}>Monthly Budget: {formatPulaShort(monthlyBudget)}  <MaterialCommunityIcons name="pencil" size={10} color={THEME.textLight} /></Text>
            <Text style={styles.budgetPct}>{Math.min(100, Math.round((m.total / monthlyBudget) * 100))}%</Text>
          </TouchableOpacity>
          <View style={styles.budgetTrack}>
            <View style={[styles.budgetFill, {
              width: `${Math.min(100, Math.round((m.total / monthlyBudget) * 100))}%`,
              backgroundColor: m.total > monthlyBudget ? THEME.danger : THEME.primary,
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
            onPress={() => router.push({ pathname: '/smartspend/recommendations', params: { time: targetDate.getTime().toString() } })}
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
          <DonutChart categories={m.categories} total={m.total} monthTime={targetDate.getTime()} basePath="/category" />
        </View>

        {/* Recommendations */}
        {recs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Smart Recommendations" onPress={() => router.push({ pathname: '/smartspend/recommendations', params: { time: targetDate.getTime().toString() } })} />
            {recs.map((rec) => (
              <TouchableOpacity key={rec.id} style={styles.recCard} onPress={() => router.push({ pathname: '/smartspend/recommendations', params: { time: targetDate.getTime().toString() } })} activeOpacity={0.85}>
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
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push({ pathname: '/smartspend/recommendations', params: { time: targetDate.getTime().toString() } })}>
              <Text style={styles.seeAllTxt}>See all recommendations →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Simulate Transaction Button */}
        <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateTx} activeOpacity={0.8}>
          <Text style={styles.simulateBtnTxt}>+ Simulate Transaction</Text>
        </TouchableOpacity>

        {/* Security notice */}
        <TouchableOpacity style={styles.secNotice} onPress={() => router.push('/security')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="shield-lock-outline" size={24} color={THEME.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.secNoticeTitle}>Advisory notice · Not regulated financial advice</Text>
            <Text style={styles.secNoticeSub}>Tap to view your Security & Privacy Centre →</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Budget Edit Modal */}
      <Modal visible={isBudgetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              placeholder="e.g. 5000"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.modalBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveBudget}>
                <Text style={styles.modalBtnTxtPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandTxt: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  bellWrap: { position: 'relative', padding: 4 },
  bellBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: THEME.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  bellBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  scroll: { padding: 12, gap: 12 },
  greetingWrap: { marginBottom: 4, paddingHorizontal: 4 },
  greetingTime: { color: THEME.textSub, fontSize: 14, fontWeight: '600' },
  greetingName: { color: THEME.text, fontSize: 24, fontWeight: '900', marginTop: 2 },
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
  secNoticeTitle: { color: THEME.warning, fontSize: 11, fontWeight: '700' },
  secNoticeSub: { color: '#555', fontSize: 10, marginTop: 2 },
  simulateBtn: { backgroundColor: '#333', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: THEME.primary },
  simulateBtnTxt: { color: THEME.primary, fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: THEME.card, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: THEME.text, marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 10, padding: 12, fontSize: 16, color: THEME.text, marginBottom: 16, backgroundColor: THEME.bg },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalBtnPrimary: { backgroundColor: THEME.primary },
  modalBtnTxt: { color: THEME.textSub, fontWeight: '700' },
  modalBtnTxtPrimary: { color: '#fff', fontWeight: '700' },
});
