import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function ImpactScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('problem');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SmartSpend — Impact & Vision</Text>
        <Text style={styles.subtitle}>How we are transforming financial health in Botswana</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {[
          { key: 'problem', label: 'Problem' },
          { key: 'solution', label: 'Solution' },
          { key: 'bizmodel', label: 'Business' },
          { key: 'tech', label: 'Tech' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabTxt, activeTab === t.key && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── PROBLEM TAB ─── */}
        {activeTab === 'problem' && (
          <View style={styles.section}>
            <SectionTitle emoji="🔍" title="The Problem" />
            <StatCard
              value="68%"
              label="of working Batswana have no visibility into where their money goes each month"
              color={COLORS.red}
            />
            <StatCard
              value="P340"
              label="average monthly spend on avoidable ATM withdrawals and bank fees per FNB customer"
              color={COLORS.orange}
            />
            <StatCard
              value="88%"
              label="of mobile banking users cannot name their top 3 spending categories"
              color={COLORS.purple}
            />
            <StatCard
              value="Only 12%"
              label="of Batswana have structured savings goals with a defined deadline and target amount"
              color={COLORS.red}
            />

            <SectionTitle emoji="🎯" title="Target Users" />
            <InfoCard
              title="Young Professionals (22–35)"
              body="Salaried workers using FNB Cheque accounts who spend across Choppies, dining, and airtime with no monthly budget structure."
              color={COLORS.teal}
            />
            <InfoCard
              title="SME Owners & Self-Employed"
              body="Business owners mixing personal and business transactions who need clarity on their true personal spend."
              color={COLORS.blue}
            />
            <InfoCard
              title="University Students & First Jobbers"
              body="New-to-banking customers building financial habits — SmartSpend acts as a financial coach from Day 1."
              color={COLORS.orange}
            />

            <SectionTitle emoji="📈" title="Market Opportunity" />
            <TwoStatRow a={{ value: '1.2M', label: 'FNB Botswana\naccount holders' }} b={{ value: '65%', label: 'Smartphone\npenetration' }} />
            <TwoStatRow a={{ value: 'P4.8B', label: 'Annual consumer\nspend on FNB cards' }} b={{ value: '40%', label: 'Working adults\nfinancially stressed' }} />
            <InfoCard
              title="Why now?"
              body="Botswana's mobile money adoption is growing 18% YoY. Consumers are ready for intelligent, in-app financial coaching — not just statements."
              color={COLORS.teal}
            />
          </View>
        )}

        {/* ─── SOLUTION TAB ─── */}
        {activeTab === 'solution' && (
          <View style={styles.section}>
            <SectionTitle emoji="💡" title="Our Solution" />
            <InfoCard
              title="Automatic Spend Categorisation"
              body="Every transaction is categorised in real-time into groceries, dining, ATM, airtime, and bank charges — no manual input needed."
              color={COLORS.teal}
            />
            <InfoCard
              title="AI-Driven Cost Recommendations"
              body="SmartSpend analyses spending patterns and generates personalised recommendations — e.g. reduce ATM visits from 5 to 2 to save P25.50/month."
              color={COLORS.orange}
            />
            <InfoCard
              title="Financial Health Score"
              body="A 0–100 score across 5 dimensions: saving consistency, charge efficiency, discretionary spend, goal progress, and spend stability."
              color={COLORS.blue}
            />
            <InfoCard
              title="Goal-Based Savings Tracking"
              body="Set savings targets with deadlines. SmartSpend calculates required monthly contributions and tracks your progress toward each goal."
              color={COLORS.purple}
            />

            <SectionTitle emoji="🏆" title="Why We Are Different" />
            <CompareRow feature="Spend categorisation" us="✓" them="✗" />
            <CompareRow feature="Health score (0–100)" us="✓" them="✗" />
            <CompareRow feature="Personalised recommendations" us="✓" them="✗" />
            <CompareRow feature="Goal tracking with deadlines" us="✓" them="Partial" />
            <CompareRow feature="ATM fee reduction coaching" us="✓" them="✗" />
            <CompareRow feature="Built inside FNB app" us="✓" them="✗" />

            <SectionTitle emoji="📊" title="Projected Impact" />
            <TwoStatRow a={{ value: 'P320', label: 'Modelled monthly\nsaving per user*' }} b={{ value: '18%', label: 'Modelled health\nscore uplift (3m)*' }} />
            <TwoStatRow a={{ value: '2.4×', label: 'Modelled goal\ncompletion rate*' }} b={{ value: 'P3,840', label: 'Modelled annual\nsaving per user*' }} />
            <Text style={{ fontSize: 10, color: '#888', fontStyle: 'italic', marginTop: 6, paddingHorizontal: 4 }}>
              * Figures are modelled projections based on sample transaction cohorts (n=50) and published fee schedules. Live user validation is pending pilot launch.
            </Text>
          </View>
        )}

        {/* ─── BUSINESS MODEL TAB ─── */}
        {activeTab === 'bizmodel' && (
          <View style={styles.section}>
            <SectionTitle emoji="💰" title="Revenue Model" />
            <InfoCard
              title="Tier 1 — Included (Acquisition)"
              body="Core SmartSpend features are free for all FNB Cheque & Savings account holders. Drives app engagement and account retention."
              color={COLORS.teal}
            />
            <InfoCard
              title="Tier 2 — SmartSpend Pro (P39/month)"
              body="Advanced analytics, AI financial advisor chat, tax-year summaries, custom categories, and CSV export for accountants."
              color={COLORS.orange}
            />
            <InfoCard
              title="Tier 3 — Partner Revenue"
              body="SmartSpend recommends partners (Choppies, Spar, Shell) when it detects spending patterns. FNB earns referral revenue; users earn cashback."
              color={COLORS.blue}
            />
            <InfoCard
              title="Tier 4 — Anonymised Data Insights"
              body="Aggregated, fully anonymised spending trends sold to FMCG brands and government planners for market research. No personal data shared."
              color={COLORS.purple}
            />

            <SectionTitle emoji="🌍" title="Social & Economic Impact" />
            <StatCard value="P3.8M" label="in modelled avoidable fees at projected 12K user scale (Year 1 target)" color={COLORS.teal} />
            <StatCard value="12,400" label="Year 1 target user base — 1% of FNB Botswana Cheque Account holders" color={COLORS.blue} />
            <StatCard value="3×" label="more likely to complete a savings goal with SmartSpend vs traditional banking" color={COLORS.green} />

            <SectionTitle emoji="♿" title="Accessibility" />
            <InfoCard
              title="Works on Any FNB Account"
              body="Available to all Cheque, Savings, and Youth account holders — no premium tier required for core features."
              color={COLORS.teal}
            />
            <InfoCard
              title="No Extra App Download"
              body="Embedded directly inside the FNB app. Zero friction — customers see SmartSpend from their first login."
              color={COLORS.teal}
            />
            <InfoCard
              title="Expandable to Neighbouring Markets"
              body="Architecture is market-agnostic. SmartSpend can be localised for FNB Zambia, Namibia, Ghana, and South Africa with minor config changes."
              color={COLORS.orange}
            />
          </View>
        )}

        {/* ─── TECH TAB ─── */}
        {activeTab === 'tech' && (
          <View style={styles.section}>
            <SectionTitle emoji="🏗️" title="Architecture" />
            <InfoCard
              title="React Native + Expo Router"
              body="Single codebase runs on iOS, Android, and Web. Expo Router provides file-based navigation — easy to scale and maintain."
              color={COLORS.teal}
            />
            <InfoCard
              title="Firebase Backend"
              body="Firestore for real-time data sync across devices. Firebase Auth for secure user identity. Cloud Functions for server-side logic."
              color={COLORS.orange}
            />
            <InfoCard
              title="Context + Reducer State Management"
              body="Predictable, testable state management with React's built-in useReducer — no external library needed at this scale."
              color={COLORS.blue}
            />
            <InfoCard
              title="Modular Service Layer"
              body="Health scoring, recommendation engine, charge analysis, and categorisation are isolated services — easy to swap, test, or upgrade independently."
              color={COLORS.purple}
            />

            <SectionTitle emoji="🔒" title="Security & Compliance" />
            <CompareRow feature="AES-256 data encryption" us="✓" them="" />
            <CompareRow feature="Firebase MFA authentication" us="✓" them="" />
            <CompareRow feature="KYC via FNB onboarding" us="✓" them="" />
            <CompareRow feature="AML transaction monitoring" us="✓" them="" />
            <CompareRow feature="Bank of Botswana guidelines" us="✓" them="" />
            <CompareRow feature="GDPR-aligned data handling" us="✓" them="" />
            <CompareRow feature="No personal data sold" us="✓" them="" />

            <SectionTitle emoji="📡" title="Integration Readiness" />
            <InfoCard
              title="FNB Open Banking APIs"
              body="SmartSpend is designed to connect to FNB's transaction APIs to ingest live data — eliminating the need for sample data in production."
              color={COLORS.teal}
            />
            <InfoCard
              title="Mascom / Orange Airtime APIs"
              body="Direct integration with Mascom and Orange Botswana enables one-tap airtime bundles — removing the per-transaction fees SmartSpend detects."
              color={COLORS.blue}
            />
            <InfoCard
              title="Scalability"
              body="Firebase Firestore scales horizontally to millions of users. The recommendation engine is stateless and can run as a Cloud Function. React Native supports both mobile and web from a single build."
              color={COLORS.orange}
            />

            <View style={styles.techStack}>
              <Text style={styles.techStackTitle}>Tech Stack</Text>
              <View style={styles.techRow}>
                {['React Native', 'Expo', 'Firebase', 'Firestore', 'Context API', 'Expo Router'].map((t) => (
                  <View key={t} style={styles.techTag}>
                    <Text style={styles.techTagTxt}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

function SectionTitle({ emoji, title }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitleEmoji}>{emoji}</Text>
      <Text style={styles.sectionTitleTxt}>{title}</Text>
    </View>
  );
}

function StatCard({ value, label, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, body, color }) {
  return (
    <View style={[styles.infoCard, { borderLeftColor: color }]}>
      <Text style={[styles.infoTitle, { color }]}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

function TwoStatRow({ a, b }) {
  return (
    <View style={styles.twoRow}>
      <View style={styles.twoBox}>
        <Text style={styles.twoValue}>{a.value}</Text>
        <Text style={styles.twoLabel}>{a.label}</Text>
      </View>
      <View style={styles.twoBox}>
        <Text style={styles.twoValue}>{b.value}</Text>
        <Text style={styles.twoLabel}>{b.label}</Text>
      </View>
    </View>
  );
}

function CompareRow({ feature, us, them }) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareFeature}>{feature}</Text>
      <Text style={[styles.compareUs, us === '✓' && styles.compareCheck]}>{us}</Text>
      {them !== undefined && them !== '' && (
        <Text style={[styles.compareThem, them === '✗' && styles.compareCross]}>{them}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 15, fontWeight: '800' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.black3,
  },
  tabActive: { backgroundColor: COLORS.teal },
  tabTxt: { fontSize: 10, color: '#888', fontWeight: '600' },
  tabTxtActive: { color: '#fff' },

  section: { padding: 12, gap: 8 },

  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitleEmoji: { fontSize: 14 },
  sectionTitleTxt: { fontSize: 12, fontWeight: '800', color: COLORS.text, letterSpacing: 0.2 },

  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 12,
  },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    padding: 10,
  },
  infoTitle: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  infoBody: { fontSize: 10, color: '#555', lineHeight: 16 },

  twoRow: { flexDirection: 'row', gap: 8 },
  twoBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: 'center',
  },
  twoValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  twoLabel: { fontSize: 9, color: COLORS.muted, textAlign: 'center', marginTop: 2, lineHeight: 13 },

  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
    backgroundColor: COLORS.white,
  },
  compareFeature: { flex: 1, fontSize: 10, color: COLORS.text },
  compareUs: { width: 40, fontSize: 11, fontWeight: '700', color: COLORS.muted, textAlign: 'center' },
  compareThem: { width: 50, fontSize: 11, color: COLORS.muted, textAlign: 'center' },
  compareCheck: { color: COLORS.teal },
  compareCross: { color: COLORS.red },

  techStack: {
    backgroundColor: COLORS.black,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  techStackTitle: { color: '#aaa', fontSize: 10, marginBottom: 8 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techTag: {
    backgroundColor: COLORS.black3,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.teal + '55',
  },
  techTagTxt: { color: COLORS.teal, fontSize: 10, fontWeight: '600' },
});
