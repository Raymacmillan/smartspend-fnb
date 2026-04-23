import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import THEME from '../src/constants/theme';

const LAYERS = [
  {
    num: '01',
    icon: '📱',
    title: 'Frontend Layer',
    subtitle: 'React Native + Expo',
    color: THEME.primary,
    components: ['Dashboard Screen', 'Analytics Screen', 'Goals Screen', 'Security Centre', 'Onboarding & PIN Auth'],
    tech: ['React Native', 'Expo SDK 54', 'Expo Router', 'React Context'],
    desc: 'Cross-platform mobile UI rendered via React Native. Expo Router handles file-based navigation. All sensitive data rendered client-side only — no PII in URLs or logs.',
  },
  {
    num: '02',
    icon: '📊',
    title: 'Analytics Engine',
    subtitle: 'Health Scoring & Trend Analysis',
    color: THEME.info,
    components: ['Financial Health Scorer', 'Score Breakdown (5 factors)', '3-Month Trend Builder', 'Category % Change Calculator'],
    tech: ['Pure JS', 'Rule Engine', 'Weighted Scoring'],
    desc: 'Computes a 100-point financial health score across 5 weighted factors: spending control, savings rate, ATM behaviour, fee exposure, and goal progress. Runs entirely on-device.',
  },
  {
    num: '03',
    icon: '💡',
    title: 'Rules & Recommendation Engine',
    subtitle: 'Smart Advisory Insights',
    color: THEME.warning,
    components: ['Category Threshold Rules', 'Severity Classifier (HIGH/MED/LOW)', 'Saving Opportunity Calculator', 'Contextual Tip Generator'],
    tech: ['Rule-based Engine', 'Threshold Config', 'Priority Queue'],
    desc: 'Applies a library of financial rules to category spending. Classifies opportunities by severity and estimated monthly saving. Outputs advisory insights — never automated decisions.',
  },
  {
    num: '04',
    icon: '💾',
    title: 'Transaction Data Layer',
    subtitle: 'Data Minimisation by Design',
    color: THEME.purple,
    components: ['Category Aggregator', 'PII Stripper', 'Monthly Bucket Store', 'Sample Data Injector'],
    tech: ['In-Memory Store', 'Firestore (scaffold)', 'JSON Schema'],
    desc: 'Raw transactions are immediately aggregated into category buckets. Merchant names, exact times, and geolocation are stripped. Only category totals and anonymised counts are retained.',
  },
  {
    num: '05',
    icon: '🎯',
    title: 'Goal Management Service',
    subtitle: 'Savings Target Tracking',
    color: THEME.success,
    components: ['Goal Calculator', 'Required Monthly Rate', 'On-Track Classifier', 'Deadline Progress Engine'],
    tech: ['useReducer', 'Date arithmetic', 'Context API'],
    desc: 'Calculates required monthly savings rate from current progress and deadline. Classifies each goal as on-track or behind. Dispatches state changes through the global reducer.',
  },
  {
    num: '06',
    icon: '🔔',
    title: 'Notifications Engine',
    subtitle: 'Proactive Alerts & Warnings',
    color: THEME.danger,
    components: ['Spending Threshold Alerts', 'Fee Warning System', 'Goal Progress Nudges', 'Health Score Change Notifications'],
    tech: ['In-App Notifications', 'Expo Notifications (scaffold)', 'Priority Queue'],
    desc: 'Triggers contextual alerts when spending crosses thresholds, fees are detected, or goal progress falls behind. All notifications are advisory only and require user consent.',
  },
  {
    num: '07',
    icon: '🔗',
    title: 'API Integration Layer',
    subtitle: 'Secure External Connectivity',
    color: THEME.textSub,
    components: ['Firebase Auth (scaffold)', 'Firestore Adapter', 'OAuth 2.0 Token Manager', 'Rate Limiter & Retry Logic'],
    tech: ['Firebase SDK', 'OAuth 2.0', 'JWT', 'REST'],
    desc: 'All external API calls use short-lived JWT tokens. API keys are server-side only. Client never has raw credentials. TLS 1.3 enforced on all connections. Anomaly detection active.',
  },
];

const SECURITY_SUMMARY = [
  { icon: '🔐', label: 'Encryption', value: 'AES-256 at rest · TLS 1.3 in transit' },
  { icon: '👥', label: 'Access Control', value: 'RBAC — role-based, least-privilege' },
  { icon: '🛡️', label: 'Data Minimisation', value: 'PII stripped at ingestion layer' },
  { icon: '✅', label: 'Consent', value: 'Granular, per-feature consent model' },
  { icon: '📋', label: 'Audit Trail', value: 'Append-only, 90-day immutable log' },
  { icon: '🔒', label: 'Privacy-by-Design', value: 'Privacy embedded in architecture' },
];

export default function Architecture() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>System Architecture</Text>
          <Text style={styles.sub}>7-Layer Layered Architecture</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.archTypeCard}>
          <Text style={styles.archTypeTitle}>🏗️ Layered (N-Tier) Architecture</Text>
          <Text style={styles.archTypeDesc}>
            SmartSpend uses a strict 7-layer architecture with clear separation of concerns.
            Each layer has a single responsibility and communicates only with adjacent layers.
            This ensures security, testability, and maintainability.
          </Text>
          <View style={styles.archProps}>
            {['Separation of Concerns', 'Single Responsibility', 'Unidirectional Data Flow', 'Privacy-by-Design'].map((p) => (
              <View key={p} style={styles.archProp}><Text style={styles.archPropTxt}>✓ {p}</Text></View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>TAP A LAYER TO EXPAND</Text>

        {LAYERS.map((layer, i) => {
          const isOpen = expanded === i;
          return (
            <View key={i}>
              {i > 0 && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <Text style={styles.connectorArrow}>↕</Text>
                  <View style={styles.connectorLine} />
                </View>
              )}
              <TouchableOpacity
                style={[styles.layerCard, { borderLeftColor: layer.color }]}
                onPress={() => setExpanded(isOpen ? null : i)}
                activeOpacity={0.85}
              >
                <View style={styles.layerTop}>
                  <View style={[styles.layerNum, { backgroundColor: layer.color }]}>
                    <Text style={styles.layerNumTxt}>{layer.num}</Text>
                  </View>
                  <View style={styles.layerIconWrap}>
                    <Text style={{ fontSize: 20 }}>{layer.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.layerTitle}>{layer.title}</Text>
                    <Text style={styles.layerSubtitle}>{layer.subtitle}</Text>
                  </View>
                  <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                </View>

                {isOpen && (
                  <View style={styles.layerBody}>
                    <Text style={styles.layerDesc}>{layer.desc}</Text>

                    <Text style={styles.layerSectionLabel}>Components</Text>
                    {layer.components.map((c) => (
                      <View key={c} style={styles.componentRow}>
                        <View style={[styles.componentDot, { backgroundColor: layer.color }]} />
                        <Text style={styles.componentTxt}>{c}</Text>
                      </View>
                    ))}

                    <Text style={styles.layerSectionLabel}>Tech Stack</Text>
                    <View style={styles.techRow}>
                      {layer.tech.map((t) => (
                        <View key={t} style={[styles.techTag, { backgroundColor: layer.color + '22' }]}>
                          <Text style={[styles.techTagTxt, { color: layer.color }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>SECURITY ACROSS ALL LAYERS</Text>
        <View style={styles.securityGrid}>
          {SECURITY_SUMMARY.map((s) => (
            <View key={s.label} style={styles.secCard}>
              <Text style={styles.secIcon}>{s.icon}</Text>
              <Text style={styles.secLabel}>{s.label}</Text>
              <Text style={styles.secValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dataFlowCard}>
          <Text style={styles.dataFlowTitle}>📡 Data Flow</Text>
          <View style={styles.dataFlow}>
            {['Bank API', '→', 'Data Layer', '→', 'Analytics', '→', 'UI', '→', 'User'].map((step, i) => (
              <Text key={i} style={step === '→' ? styles.dataFlowArrow : styles.dataFlowStep}>{step}</Text>
            ))}
          </View>
          <Text style={styles.dataFlowNote}>
            Data flows in one direction only. No user-initiated writes to banking data.
            All analysis happens on anonymised aggregates — never raw transactions.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>SAMPLE API INTEGRATION</Text>
        <View style={styles.apiCard}>
          <View style={styles.apiRow}>
            <View style={[styles.methodBadge, { backgroundColor: THEME.success }]}>
              <Text style={styles.methodTxt}>GET</Text>
            </View>
            <Text style={styles.endpointTxt}>/v1/accounts/{'{id}'}/transactions</Text>
          </View>
          <Text style={styles.apiLabel}>Request Headers</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLine}><Text style={styles.codeKey}>Authorization:</Text> Bearer eyJhbGc...</Text>
            <Text style={styles.codeLine}><Text style={styles.codeKey}>X-Consent-Token:</Text> analytics-v2</Text>
            <Text style={styles.codeLine}><Text style={styles.codeKey}>X-Request-ID:</Text> uuid-v4</Text>
          </View>
          <Text style={styles.apiLabel}>Response (minimised)</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLine}><Text style={styles.codeBracket}>{'{'}</Text></Text>
            <Text style={styles.codeLine}>  <Text style={styles.codeKey}>"category":</Text> <Text style={styles.codeStr}>"dining"</Text>,</Text>
            <Text style={styles.codeLine}>  <Text style={styles.codeKey}>"amount":</Text> <Text style={styles.codeNum}>85.00</Text>,</Text>
            <Text style={styles.codeLine}>  <Text style={styles.codeKey}>"date":</Text> <Text style={styles.codeStr}>"2025-03-03"</Text>,</Text>
            <Text style={styles.codeLine}>  <Text style={styles.codeKey}>"merchant_hash":</Text> <Text style={styles.codeStr}>"a1f3..."</Text></Text>
            <Text style={styles.codeLine}><Text style={styles.codeBracket}>{'}'}</Text></Text>
          </View>
          <Text style={styles.apiNote}>
            🛡️ Raw merchant name, card number, and geolocation are stripped at the API gateway.
            Only categorised, hashed data reaches the analytics layer.
          </Text>
          <View style={styles.stackRow}>
            {['OAuth 2.0', 'JWT (15min)', 'mTLS', 'Rate Limit 60/min', 'Cert Pinning'].map((t) => (
              <View key={t} style={styles.stackTag}>
                <Text style={styles.stackTagTxt}>{t}</Text>
              </View>
            ))}
          </View>
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
  scroll: { padding: 14, gap: 0 },
  archTypeCard: { backgroundColor: THEME.dark, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ffffff10' },
  archTypeTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  archTypeDesc: { color: THEME.textLight, fontSize: 11, lineHeight: 18, marginBottom: 12 },
  archProps: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  archProp: { backgroundColor: '#ffffff15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  archPropTxt: { color: THEME.primary, fontSize: 9, fontWeight: '600' },
  sectionLabel: { fontSize: 9, color: THEME.textLight, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  connector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, gap: 4 },
  connectorLine: { flex: 1, height: 1, backgroundColor: THEME.border },
  connectorArrow: { fontSize: 12, color: THEME.textLight },
  layerCard: { backgroundColor: THEME.card, borderRadius: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, overflow: 'hidden' },
  layerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  layerNum: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  layerNumTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  layerIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  layerTitle: { fontSize: 13, fontWeight: '800', color: THEME.text },
  layerSubtitle: { fontSize: 9, color: THEME.textSub, marginTop: 1 },
  chevron: { color: THEME.textLight, fontSize: 20, transform: [{ rotate: '0deg' }] },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  layerBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 0.5, borderTopColor: THEME.divider },
  layerDesc: { fontSize: 11, color: THEME.textSub, lineHeight: 17, marginTop: 10, marginBottom: 10 },
  layerSectionLabel: { fontSize: 9, color: THEME.textLight, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  componentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  componentDot: { width: 6, height: 6, borderRadius: 3 },
  componentTxt: { fontSize: 11, color: THEME.text },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  techTagTxt: { fontSize: 9, fontWeight: '700' },
  securityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  secCard: { width: '48%', backgroundColor: THEME.card, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  secIcon: { fontSize: 20, marginBottom: 6 },
  secLabel: { fontSize: 11, fontWeight: '700', color: THEME.text, marginBottom: 2 },
  secValue: { fontSize: 9, color: THEME.textSub, lineHeight: 14 },
  dataFlowCard: { backgroundColor: THEME.darkCard, borderRadius: 14, padding: 14 },
  dataFlowTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 12 },
  dataFlow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  dataFlowStep: { backgroundColor: '#ffffff15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, color: THEME.primary, fontSize: 10, fontWeight: '700' },
  dataFlowArrow: { color: THEME.textLight, fontSize: 14 },
  dataFlowNote: { fontSize: 10, color: THEME.textLight, lineHeight: 16 },
  apiCard: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  apiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  methodBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  methodTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  endpointTxt: { fontSize: 11, fontWeight: '700', color: THEME.text, fontFamily: 'monospace' },
  apiLabel: { fontSize: 9, color: THEME.textLight, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  codeBlock: { backgroundColor: THEME.dark, borderRadius: 8, padding: 10, marginBottom: 10 },
  codeLine: { color: THEME.textLight, fontSize: 10, fontFamily: 'monospace', lineHeight: 16 },
  codeKey: { color: THEME.info },
  codeStr: { color: THEME.success },
  codeNum: { color: THEME.warning },
  codeBracket: { color: THEME.primary },
  apiNote: { fontSize: 10, color: THEME.textSub, lineHeight: 15, marginBottom: 10 },
  stackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stackTag: { backgroundColor: THEME.primaryFade, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  stackTagTxt: { color: THEME.primaryDark, fontSize: 9, fontWeight: '700' },
});
