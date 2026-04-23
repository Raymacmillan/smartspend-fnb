import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import { generateRecommendations } from '../../src/services/recommendations/engine';
import RecommendationCard from '../../src/components/recommendations/RecommendationCard';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function Recommendations() {
  const router = useRouter();
  const { state } = useStore();
  const m = state.transactions[state.currentMonth];
  const recs = generateRecommendations(m.categories);
  const totalSaving = recs.reduce((sum, r) => sum + r.savingRaw, 0);
  const yearlySaving = totalSaving * 12;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Smart Recommendations</Text>
        <Text style={styles.subtitle}>{recs.length} ways to reduce costs</Text>
      </View>

      <ScrollView>
        <View style={{ height: 10 }} />
        {recs.map((rec) => <RecommendationCard key={rec.id} rec={rec} />)}

        <View style={styles.totalHint}>
          <Text style={styles.totalHintTitle}>
            Total potential saving: P {Math.round(totalSaving)}/month
          </Text>
          <Text style={styles.totalHintText}>
            That's P {Math.round(yearlySaving).toLocaleString()} saved over a year from {recs.length} habit changes
          </Text>
        </View>

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
  totalHint: {
    marginHorizontal: 12,
    backgroundColor: COLORS.orangeFade,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    borderRadius: 8,
    padding: 10,
  },
  totalHintTitle: { fontSize: 11, color: COLORS.orangeDark, fontWeight: '700', marginBottom: 3 },
  totalHintText: { fontSize: 10, color: '#6d3c00' },
});