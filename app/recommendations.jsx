import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import { generateRecommendations } from '../src/services/recommendations/engine';
import { formatPula } from '../src/utils/currency';
import THEME from '../src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Recommendations() {
  const router = useRouter();
  const { state } = useStore();
  const { currentMonth, transactions } = state;
  const m = transactions && currentMonth ? transactions[currentMonth] : null;

  const [recs, setRecs] = useState([]);
  const [totalSaving, setTotalSaving] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      if (m && m.categories) {
        try {
          const fetchedRecs = await generateRecommendations(m.categories);
          setRecs(fetchedRecs || []);
          const saving = (fetchedRecs || []).reduce((sum, r) => {
            const val = Number(String(r.saving).replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
          setTotalSaving(saving);
        } catch (error) {
          console.error('Failed to generate recommendations:', error);
        }
      }
      setLoading(false);
    };

    fetchRecs();
  }, [m]);

  if (!m) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Smart Recommendations</Text>
          </View>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>No data available for this month.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Smart Recommendations</Text>
          <Text style={styles.sub}>{m.label} · Advisory insights only</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Savings summary */}
        <View style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>Potential Monthly Saving</Text>
          <Text style={styles.savingsAmt}>{formatPula(totalSaving)}</Text>
          <Text style={styles.savingsNote}>Based on {recs.length} identified opportunity{recs.length !== 1 ? 's' : ''} this month</Text>
          <View style={[styles.advisoryTag, { flexDirection: 'row', alignItems: 'center' }]}>
            <MaterialCommunityIcons name="scale-balance" size={10} color={THEME.warning} style={{ marginRight: 4 }} />
            <Text style={styles.advisoryTagTxt}>Advisory only · Not regulated financial advice</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={THEME.primary} style={{ marginTop: 20 }} />
        ) : recs.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="party-popper" size={48} color={THEME.textSub} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>Great spending habits!</Text>
            <Text style={styles.emptyTxt}>No significant optimisation opportunities found for {m.label}. Keep it up.</Text>
          </View>
        ) : (
          recs.map((rec) => (
          <View key={rec.id} style={[styles.recCard, { borderLeftColor: rec.severity === 'high' ? THEME.danger : THEME.warning }]}>
            <View style={styles.recTop}>
              <View style={[styles.severityBadge, { backgroundColor: rec.severity === 'high' ? THEME.dangerFade : THEME.warningFade, flexDirection: 'row', alignItems: 'center' }]}>
                <MaterialCommunityIcons name={rec.severity === 'high' ? 'alert-circle' : 'alert'} size={12} color={rec.severity === 'high' ? THEME.danger : THEME.warning} style={{ marginRight: 4 }}/>
                <Text style={[styles.severityTxt, { color: rec.severity === 'high' ? THEME.danger : THEME.warning }]}>
                  {rec.severity === 'high' ? 'HIGH PRIORITY' : 'MEDIUM'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="piggy-bank" size={16} color={THEME.success} />
                <Text style={styles.savingPill}>Save {rec.saving}</Text>
              </View>
            </View>

            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recSub}>{rec.subtitle}</Text>

            <View style={styles.compareRow}>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Current behaviour</Text>
                <Text style={styles.compareVal}>{rec.issue}</Text>
                <Text style={[styles.compareExtra, { color: THEME.danger }]}>Est. fees: {rec.estFees}</Text>
              </View>
              <View style={styles.compareArrow}>
                <MaterialCommunityIcons name="arrow-right" size={20} color={THEME.textLight} />
              </View>
              <View style={[styles.compareBox, styles.compareBoxGood]}>
                <Text style={styles.compareLabel}>Better option</Text>
                <Text style={[styles.compareVal, { color: THEME.success }]}>{rec.betterOption}</Text>
                <Text style={[styles.compareExtra, { color: THEME.success }]}>Save {rec.saving}</Text>
              </View>
            </View>
          </View>
          ))
        )}

        <View style={styles.disclaimer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <MaterialCommunityIcons name="scale-balance" size={16} color={THEME.warning} />
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerTxt}>
            These recommendations are AI-generated advisory insights based on your spending patterns.
            They are for informational purposes only and do not constitute regulated financial advice.
            SmartSpend is not a licensed financial services provider. Please consult a qualified
            financial advisor before making significant financial decisions.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 10, marginTop: 1 },
  scroll: { padding: 14, gap: 12 },
  savingsCard: { backgroundColor: THEME.dark, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#ffffff10' },
  savingsLabel: { color: THEME.textLight, fontSize: 11, marginBottom: 4 },
  savingsAmt: { color: THEME.primary, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  savingsNote: { color: THEME.textLight, fontSize: 11, marginBottom: 10 },
  advisoryTag: { backgroundColor: THEME.warningFade, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  advisoryTagTxt: { color: THEME.warning, fontSize: 9, fontWeight: '700' },
  empty: { backgroundColor: THEME.card, borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: THEME.text, marginBottom: 6 },
  emptyTxt: { fontSize: 12, color: THEME.textSub, textAlign: 'center', lineHeight: 18 },
  recCard: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  recTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  severityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  severityTxt: { fontSize: 9, fontWeight: '800' },
  savingPill: { fontSize: 11, fontWeight: '700', color: THEME.success },
  recTitle: { fontSize: 14, fontWeight: '800', color: THEME.text, marginBottom: 4 },
  recSub: { fontSize: 11, color: THEME.textSub, marginBottom: 12 },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compareBox: { flex: 1, backgroundColor: THEME.dangerFade, borderRadius: 10, padding: 10 },
  compareBoxGood: { backgroundColor: THEME.successFade },
  compareLabel: { fontSize: 8, color: THEME.textLight, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  compareVal: { fontSize: 11, fontWeight: '700', color: THEME.text, marginBottom: 2 },
  compareExtra: { fontSize: 9, fontWeight: '600' },
  compareArrow: { alignItems: 'center', justifyContent: 'center', width: 24 },
  disclaimer: { backgroundColor: THEME.warningFade, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.warning + '44' },
  disclaimerTitle: { fontSize: 12, fontWeight: '800', color: THEME.warning },
  disclaimerTxt: { fontSize: 10, color: THEME.text, lineHeight: 17 },
});
