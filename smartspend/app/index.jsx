import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserTransactions, getUserGoals } from '../src/services/firebase/db';
import { processTransactions } from '../src/services/dataProcessor';
import { calculateHealthScore } from '../src/services/health/scorer';
import { generateRecommendations } from '../src/services/recommendations/engine';
import { saveTransaction } from '../src/services/firebase/firestore';
import { auth } from '../src/services/firebase/config';
import { Timestamp } from 'firebase/firestore';
import COLORS from '../src/constants/colors';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    // Don't show main loader for quick refreshes, only for initial load
    if (!data) {
      setLoading(true);
    }

    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
      try {
        // 1. Fetch raw data from Firebase
        const transactions = await getUserTransactions();
        const goals = await getUserGoals();

        // 2. Process transactions for analysis
        const processedData = processTransactions(transactions, selectedMonth); // Make sure you pass your selected month state here

        // 3. Run your analysis engines
        const healthScore = calculateHealthScore({ ...processedData, goals });
        const recommendations = await generateRecommendations(processedData.categories);

        setData({ healthScore, recommendations });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Handle error display in UI
      } finally {
        setLoading(false);
      }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddRandomTransaction = async () => {
    if (!auth.currentUser) {
      console.error('No user is logged in to add a transaction.');
      return;
    }

    const descriptions = [
      { description: 'KFC GABORONE', category: 'dining' },
      { description: 'CHECKERS AIRPORT JUNCTION', category: 'groceries' },
      { description: 'ORANGE AIRTIME TOPUP', category: 'airtime' },
      { description: 'ATM WITHDRAWAL MAIN MALL', category: 'atm' },
      { description: 'ENGEN TSHOLOFELO', category: 'fuel' },
      { description: 'NANDOS GAME CITY', category: 'dining' },
      { description: 'SPAR KGALE', category: 'groceries' },
      { description: 'BPC ELECTRICITY', category: 'electricity' },
      { description: 'INTERBANK TRANSFER FEE', category: 'bankCharges' },
      { description: 'SERVICE FEE', category: 'bankCharges' },
    ];

    const randomItem = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomAmount = Math.floor(Math.random() * (450 - 10 + 1)) + 10;

    const newTx = {
      description: randomItem.description,
      amount: randomAmount,
      date: Timestamp.now(), // Use Firestore Timestamp for consistency
    };

    try {
      await saveTransaction(auth.currentUser.uid, newTx);
      console.log('Successfully added random transaction:', newTx);
      fetchData(); // Re-fetch data to update the UI instantly
    } catch (error) {
      console.error('Failed to add random transaction:', error);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color={COLORS.teal} size="large" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.inner}>
        <Text style={styles.header}>Dashboard</Text>
        {/* You can now build your UI using data.healthScore and data.recommendations */}
        <Text style={styles.score}>Health Score: {data?.healthScore?.total}/100</Text>

        {/* --- DEV BUTTON --- */}
        <TouchableOpacity style={styles.devButton} onPress={handleAddRandomTransaction}>
          <Text style={styles.devButtonText}>+ Simulate Random Transaction</Text>
        </TouchableOpacity>
        {/* Add components to display the score breakdown, recommendations, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  inner: { padding: 24 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  score: { fontSize: 22, color: COLORS.teal, marginBottom: 10 },
  devButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: COLORS.teal,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  devButtonText: {
    color: COLORS.teal,
    fontWeight: '700',
    fontSize: 12,
  },
});