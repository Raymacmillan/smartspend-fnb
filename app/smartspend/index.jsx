import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { startOfMonth } from 'date-fns';
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
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/services/firebase/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToUserTransactions } from '../../src/services/firebase/db';
import { processTransactions, getAvailableMonths } from '../../src/services/dataProcessor';
import { useGoals } from '../../src/hooks/useGoals';

export default function SmartSpendOverview() {
  const router = useRouter();
  const { goals } = useGoals(auth?.currentUser?.uid);
  const [transactions, setTransactions] = useState([]);
  const [targetMonth, setTargetMonth] = useState(startOfMonth(new Date()));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!auth?.currentUser) return;

    // Get the dynamic user name
    getDoc(doc(db, 'users', auth.currentUser.uid)).then(snap => {
      if (snap.exists()) setUserData(snap.data());
    });

    // Get real-time transactions
    const unsubscribe = subscribeToUserTransactions((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </SafeAreaView>
    );
  }

  const availableMonths = getAvailableMonths(transactions);
  const currentIdx = availableMonths.findIndex(d => d.getTime() === targetMonth.getTime());
  
  const hasPrev = currentIdx < availableMonths.length - 1;
  const hasNext = currentIdx > 0;

  const handlePrevMonth = () => { if (hasPrev) setTargetMonth(availableMonths[currentIdx + 1]); };
  const handleNextMonth = () => { if (hasNext) setTargetMonth(availableMonths[currentIdx - 1]); };

  const m = processTransactions(transactions, targetMonth);
  const diff = m.prevTotal ? percentChange(m.total, m.prevTotal) : null;

  useEffect(() => {
    async function fetchRecs() {
      const currentData = processTransactions(transactions, targetMonth);
      if (currentData.categories && currentData.categories.length > 0) {
        try {
          const res = await generateRecommendations(currentData.categories);
          setRecommendations(res || []);
        } catch (e) {
          setRecommendations([]);
        }
      } else setRecommendations([]);
    }
    fetchRecs();
  }, [transactions, targetMonth]);

  // Computed health score
  const healthScore = calculateHealthScore({
    categories: m.categories,
    total: m.total,
    goals,
    prevTotal: m.prevTotal,
  });

  const totalSaving = recommendations.reduce((sum, r) => sum + r.savingRaw, 0);
  const firstGoal = goals[0];
  const goalData = firstGoal ? calculateGoal(firstGoal) : null;

  const chargesCat = m.categories.find((c) => c.key === 'bankCharges');

  const handleInjectMockData = async () => {
    if (!auth?.currentUser) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }

    // Smart Hackathon Trick: Bulk inject a realistic "persona" spending pattern
    // This acts exactly like pulling from a real banking API without the complex setup
    const templates = [
      { desc: 'KFC GABORONE', min: 40, max: 150 },
      { desc: 'CHECKERS AIRPORT JUNCTION', min: 300, max: 1200 },
      { desc: 'ORANGE AIRTIME TOPUP', min: 10, max: 50 },
      { desc: 'ATM WITHDRAWAL MAIN MALL', min: 100, max: 500 },
      { desc: 'ENGEN TSHOLOFELO', min: 150, max: 400 },
      { desc: 'BPC ELECTRICITY', min: 50, max: 200 },
      { desc: 'MONTHLY ACCOUNT FEE', min: 15, max: 15 },
    ];

    try {
      const transactionsRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
      const start = new Date(2026, 0, 1).getTime(); // Jan 1st
      const end = new Date(2026, 2, 31, 23, 59, 59).getTime(); // Mar 31st
      
      const promises = Array.from({ length: 45 }).map(() => {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const randomAmount = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min;
        const randomTime = start + Math.random() * (end - start);
        const date = new Date(randomTime);
        return addDoc(transactionsRef, { description: template.desc, amount: randomAmount, date: Timestamp.fromDate(date) });
      });
      
      await Promise.all(promises);
      Alert.alert('Success', 'Loaded 45 realistic transactions across Jan, Feb, and March!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ FNB Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Smart Spend Analytics</Text>
        <Text style={styles.subtitle}>{userData?.name || 'SmartSpend User'} · Cheque Account</Text>
      </View>

      <MonthSwitcher
        label={m.label}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        hasPrev={hasPrev}
        hasNext={hasNext}
        diff={diff}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.totalSec}>
          <Text style={styles.totalBig}>{formatPula(m.total)}</Text>
          <Text style={styles.totalSm}>Total spent · {m.label}</Text>
        </View>

        <DonutChart categories={m.categories} total={m.total} />

        <Text style={styles.sectionLabel}>Explore your finances</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <InsightCard
              icon="lightbulb-on-outline"
              title="Recommendations"
              value={`P ${Math.round(totalSaving)}`}
              valueColor={COLORS.orange}
              subtitle="potential saving/month"
              onPress={() => router.push({
                pathname: '/smartspend/recommendations',
                params: { time: targetMonth.getTime().toString() }
              })}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="heart-pulse"
              title="Health Score"
              value={`${healthScore.total}/100`}
              valueColor={healthScore.total >= 75 ? COLORS.teal : healthScore.total >= 50 ? COLORS.orange : COLORS.red}
              subtitle="your financial health"
              onPress={() => router.push({
                pathname: '/smartspend/health-score',
                params: { time: targetMonth.getTime().toString() }
              })}
            />
          </View>
          <View style={styles.gridItem}>
            <InsightCard
              icon="bullseye-arrow"
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
              icon="credit-card-outline"
              title="Bank Charges"
              value={formatPulaShort(chargesCat?.amount || 0)}
              valueColor={COLORS.red}
              subtitle="this month"
              onPress={() => router.push({
                pathname: '/smartspend/charges',
                params: { time: targetMonth.getTime().toString() }
              })}
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

        {/* BULK INJECT MOCK API DATA BUTTON */}
        <TouchableOpacity style={styles.devButton} onPress={handleInjectMockData} activeOpacity={0.7}>
          <MaterialCommunityIcons name="database-import" size={16} color={COLORS.teal} style={{ marginRight: 6 }} />
          <Text style={styles.devButtonText}>Fetch Mock API Spending Data</Text>
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
  devButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ebfdfb',
    borderWidth: 1,
    borderColor: COLORS.teal,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 14,
  },
  devButtonText: { color: COLORS.teal, fontWeight: '800', fontSize: 13 },
});
