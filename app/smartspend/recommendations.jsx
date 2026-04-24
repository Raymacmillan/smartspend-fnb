import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import THEME from '../../src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../src/services/firebase/config';
import { subscribeToUserTransactions } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';
import BottomNav from '../../src/components/common/BottomNav';

export default function Recommendations() {
  const router = useRouter();
  const { time, month } = useGlobalSearchParams();
  const initialDate = time ? new Date(Number(time)) : (month ? new Date(month) : startOfMonth(new Date()));
  const [targetMonth, setTargetMonth] = useState(initialDate);
  const [transactions, setTransactions] = useState([]);
  const [recs, setRecs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!auth?.currentUser) return;
    const unsubscribe = subscribeToUserTransactions((txs) => {
      setTransactions(txs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (time) setTargetMonth(new Date(Number(time)));
    else if (month) setTargetMonth(new Date(month));
  }, [time, month]);

  // Mathematical signature to prevent React memory-reference infinite loops
  const categoriesSignature = transactions.length > 0 
    ? JSON.stringify(processTransactions(transactions, targetMonth).categories.map(c => ({ key: c.key, amount: c.amount, count: c.transactions?.length })))
    : '';

  useEffect(() => {
    async function fetchRecommendations() {
      setIsAnalyzing(true);
      const processedData = processTransactions(transactions, targetMonth);
      const generated = await generateRecommendations(processedData?.categories || []);
      
      setRecs(generated || []);
      setIsAnalyzing(false);
      setInitialLoad(false);
    }
    if (transactions.length > 0) fetchRecommendations();
    else {
      setIsAnalyzing(false);
      setInitialLoad(false);
    }
  }, [categoriesSignature]);

  const totalSaving = recs.reduce((sum, r) => sum + r.savingRaw, 0);
  const yearlySaving = totalSaving * 12;

  const handleAddRandomTransaction = async () => {
    if (!auth?.currentUser) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }

    const descriptions = [
      { description: 'KFC GABORONE', category: 'dining' },
      { description: 'CHECKERS AIRPORT JUNCTION', category: 'groceries' },
      { description: 'ORANGE AIRTIME TOPUP', category: 'airtime' },
      { description: 'ATM WITHDRAWAL MAIN MALL', category: 'atm' },
      { description: 'ENGEN TSHOLOFELO', category: 'fuel' },
      { description: 'BPC ELECTRICITY', category: 'electricity' },
      { description: 'SERVICE FEE', category: 'bankCharges' },
    ];

    const randomItem = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomAmount = Math.floor(Math.random() * (450 - 10 + 1)) + 10;

    // Strictly add to the CURRENT REAL-WORLD MONTH so hardcoded past months remain untouched
    const simDate = new Date();

    const newTx = {
      description: randomItem.description,
      amount: randomAmount,
      date: Timestamp.fromDate(simDate),
    };

    try {
      const transactionsRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
      await addDoc(transactionsRef, newTx);
      setTargetMonth(simDate); // Auto-navigate to the current month to see the update!
      Alert.alert('Success', `Transaction Added: P${randomAmount} at ${randomItem.description}.\n\nMoved to the current month to analyze the live data!`);
    } catch (error) {
      console.error('Failed to add random transaction:', error);
      Alert.alert('Error', 'Failed to add transaction.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Recommendations</Text>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setTargetMonth(d => subMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>‹</Text></TouchableOpacity>
          <Text style={styles.subtitle}>{format(targetMonth, 'MMMM yyyy')} · AI Insights</Text>
          <TouchableOpacity onPress={() => setTargetMonth(d => addMonths(d, 1))} style={styles.navBtn}><Text style={styles.navBtnTxt}>›</Text></TouchableOpacity>
        </View>
      </View>

      {initialLoad ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loaderText}>SmartSpend is analyzing your spending...</Text>
        </View>
      ) : (
      <ScrollView>
        <View style={{ height: 10 }} />
        {isAnalyzing && (
          <View style={styles.refreshingBadge}>
            <ActivityIndicator size="small" color={THEME.primary} />
            <Text style={styles.refreshingText}>Recalculating AI Insights...</Text>
          </View>
        )}
        {recs.map((rec) => (
          <View key={rec.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: rec.severity === 'high' ? THEME.dangerFade : THEME.warningFade }]}>
                <MaterialCommunityIcons name={rec.icon || 'lightbulb-on'} size={24} color={rec.severity === 'high' ? THEME.danger : THEME.warning} />
              </View>
              <View style={styles.cardHeaderTxt}>
                <Text style={styles.cardTitle}>{rec.title}</Text>
                <Text style={styles.cardSubtitle}>{rec.subtitle}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.issueTxt}>
                <Text style={styles.boldTxt}>The Insight: </Text>{rec.issue}
              </Text>
              <Text style={styles.actionTxt}>
                <Text style={styles.boldPrimaryTxt}>The Plan: </Text>{rec.betterOption}
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.savingBadge}>
                <MaterialCommunityIcons name="trending-up" size={16} color={THEME.success} />
                <Text style={styles.savingTxt}>Potential Impact: {rec.saving}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.totalHint}>
          <Text style={styles.totalHintTitle}>
            Total potential saving: P {Math.round(totalSaving)}/month
          </Text>
          <Text style={styles.totalHintText}>
            That's P {Math.round(yearlySaving).toLocaleString()} saved over a year from {recs.length} habit changes
          </Text>
        </View>

        {/* DEV BUTTON */}
        <TouchableOpacity style={styles.devButton} onPress={handleAddRandomTransaction}>
          <Text style={styles.devButtonText}>+ Simulate Random Transaction</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
      )}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: THEME.textLight, fontSize: 11 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontSize: 18, lineHeight: 22 },
  refreshingBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, marginBottom: 10, backgroundColor: THEME.primary + '15', marginHorizontal: 12, borderRadius: 8 },
  refreshingText: { fontSize: 12, color: THEME.primary, fontWeight: '700' },
  totalHint: {
    marginHorizontal: 12,
    backgroundColor: THEME.warningFade,
    borderLeftWidth: 4,
    borderLeftColor: THEME.warning,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  totalHintTitle: { fontSize: 12, color: THEME.warning, fontWeight: '800', marginBottom: 4 },
  totalHintText: { fontSize: 11, color: THEME.text, lineHeight: 16 },
  devButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: THEME.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 20,
  },
  devButtonText: { color: THEME.primary, fontWeight: '800', fontSize: 13 },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: THEME.primary, marginTop: 12, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: THEME.card, marginHorizontal: 12, marginBottom: 12, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardHeaderTxt: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: THEME.text },
  cardSubtitle: { fontSize: 11, color: THEME.textSub, marginTop: 2 },
  cardBody: { backgroundColor: THEME.bg, borderRadius: 10, padding: 12, marginBottom: 12 },
  issueTxt: { fontSize: 11, color: THEME.text, lineHeight: 18, marginBottom: 8 },
  actionTxt: { fontSize: 11, color: THEME.text, lineHeight: 18 },
  boldTxt: { fontWeight: '800', color: THEME.text },
  boldPrimaryTxt: { fontWeight: '800', color: THEME.primary },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  savingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.successFade, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  savingTxt: { color: THEME.success, fontSize: 11, fontWeight: '800' }
});