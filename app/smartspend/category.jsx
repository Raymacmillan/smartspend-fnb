import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import THEME from '../../src/constants/theme';
import { auth } from '../../src/services/firebase/config';
import { subscribeToUserTransactions } from '../../src/services/firebase/db';
import { processTransactions } from '../../src/services/dataProcessor';

export default function CategoryBreakdown() {
  const router = useRouter();
  const { idx, time } = useGlobalSearchParams();
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    if (!auth?.currentUser) return;
    const unsubscribe = subscribeToUserTransactions((txs) => {
      setTransactions(txs);
    });
    return () => unsubscribe();
  }, []);

  if (!transactions) {
    return <ActivityIndicator color={THEME.primary} size="large" style={{ marginTop: 50 }} />;
  }

  const targetDate = time ? new Date(Number(time)) : new Date();
  const processedData = processTransactions(transactions, targetDate);
  const category = processedData.categories[Number(idx)];

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Category not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderTransaction = ({ item }) => {
    // Convert Firestore timestamp to a readable date
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const dateString = isNaN(dateObj) ? 'Recent' : dateObj.toLocaleDateString();

    return (
      <View style={styles.transactionRow}>
        <View>
          <Text style={styles.txDesc}>{item.description}</Text>
          <Text style={styles.txDate}>{dateString}</Text>
        </View>
        <Text style={styles.txAmount}>P {Number(item.amount).toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back to Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{category.emoji} {category.name}</Text>
        <Text style={styles.subtitle}>Total spent this month: P {category.amount.toFixed(2)}</Text>
      </View>

      <FlatList
        data={category.transactions}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, paddingBottom: 20 },
  back: { color: THEME.primary, fontSize: 12, marginBottom: 10, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: THEME.textLight, fontSize: 12, marginTop: 4 },
  listContainer: { padding: 16 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  txDesc: { fontSize: 14, fontWeight: '700', color: THEME.text },
  txDate: { fontSize: 12, color: THEME.textSub, marginTop: 4 },
  txAmount: { fontSize: 14, fontWeight: '800', color: THEME.text },
  error: { color: THEME.danger, textAlign: 'center', marginTop: 50, fontSize: 16 },
  backBtn: { marginTop: 20, alignSelf: 'center' },
  backText: { color: THEME.primary, fontSize: 16, fontWeight: '700' }
});