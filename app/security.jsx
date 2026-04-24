import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRINCIPLES = [
  {
    icon: 'shield-check',
    title: 'Data Minimisation',
    badge: 'GDPR Art. 5(1)(c)',
    badgeColor: THEME.info,
    desc: 'Only transaction categories and aggregated totals are retained. Raw merchant names, geolocation, and card numbers are stripped at ingestion.',
    status: 'Active',
    statusColor: THEME.success,
  },
  {
    icon: 'account-group',
    title: 'Role-Based Access Control',
    badge: 'RBAC',
    badgeColor: THEME.purple,
    desc: 'User tier determines data access. Advisory insights are read-only. No write access to transaction records. Admin functions require separate elevated credentials.',
    status: 'Enforced',
    statusColor: THEME.success,
  },
  {
    icon: 'lock',
    title: 'Encryption in Transit & at Rest',
    badge: 'AES-256 · TLS 1.3',
    badgeColor: THEME.primary,
    desc: 'All data in transit is protected with TLS 1.3. Data at rest uses AES-256 encryption. PIN is hashed locally and never transmitted to any server.',
    status: 'Active',
    statusColor: THEME.success,
  },
  {
    icon: 'check-circle',
    title: 'Customer Consent',
    badge: 'GDPR Art. 6 & 7',
    badgeColor: THEME.info,
    desc: 'Analytics, personalisation, and data-sharing consent is captured during onboarding. Users can revoke consent at any time from this screen.',
    status: 'Confirmed',
    statusColor: THEME.success,
  },
  {
    icon: 'clipboard-text',
    title: 'Audit Trail',
    badge: 'Immutable Log',
    badgeColor: THEME.warning,
    desc: 'Every data access, login, and insight generation is logged with a timestamp. Logs are append-only and cannot be deleted by end-users.',
    status: 'Active',
    statusColor: THEME.success,
  },
  {
    icon: 'shield-lock',
    title: 'Privacy-by-Design',
    badge: 'PbD Framework',
    badgeColor: THEME.primaryDark,
    desc: 'Privacy is embedded into the system architecture from the ground up — not added as an afterthought. All new features undergo a Privacy Impact Assessment.',
    status: 'Embedded',
    statusColor: THEME.success,
  },
  {
    icon: 'link',
    title: 'Secure API Integration',
    badge: 'OAuth 2.0 · JWT',
    badgeColor: THEME.info,
    desc: 'All API calls use short-lived JWT tokens with OAuth 2.0. API keys are never exposed client-side. Rate limiting and anomaly detection are active.',
    status: 'Active',
    statusColor: THEME.success,
  },
  {
    icon: 'scale-balance',
    title: 'Advisory Separation',
    badge: 'Regulatory Boundary',
    badgeColor: THEME.danger,
    desc: 'SmartSpend provides advisory insights only. We are explicitly separated from regulated financial advice. No automated financial decisions are made on behalf of the user.',
    status: 'Enforced',
    statusColor: THEME.success,
  },
  {
    icon: '🆔',
    title: 'Know Your Customer (KYC)',
    badge: 'FATF · Bank of Botswana',
    badgeColor: THEME.info,
    desc: 'User identity is verified at onboarding through FNB\'s existing KYC pipeline (Omang ID + biometric). SmartSpend inherits verified customer status — no parallel KYC database is maintained, minimising PII exposure.',
    status: 'Inherited',
    statusColor: THEME.success,
  },
  {
    icon: '🕵️',
    title: 'Anti-Money Laundering (AML)',
    badge: 'FIA Botswana · FATF 40',
    badgeColor: THEME.warning,
    desc: 'Transaction pattern monitoring flags structuring, rapid cash movements, and unusual cross-border activity. Suspicious Transaction Reports (STRs) are escalated to FNB\'s compliance team. SmartSpend itself holds no funds — all AML obligations rest with the regulated banking partner.',
    status: 'Monitored',
    statusColor: THEME.success,
  },
];

export default function Security() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { consent, auditLog } = state;
  const [tab, setTab] = useState('principles');

  const toggleConsent = (key) => {
    if (key === 'analytics') return;
    dispatch({ type: 'SET_CONSENT', payload: { [key]: !consent[key] } });
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: Date.now(),
        action: 'Consent updated',
        detail: `${key} consent ${!consent[key] ? 'enabled' : 'disabled'} by user`,
        time: 'Just now',
        icon: 'check-circle',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Security & Privacy Centre</Text>
          <Text style={styles.sub}>Your data rights & protection</Text>
        </View>
        <View style={styles.lockBadge}>
          <MaterialCommunityIcons name="lock" size={12} color={THEME.success} style={{ marginRight: 4 }} />
          <Text style={styles.lockTxt}>Secured</Text>
        </View>
      </View>

      {/* Compliance strip */}
      <View style={styles.complianceStrip}>
        {['AES-256', 'TLS 1.3', 'GDPR-aligned', 'RBAC', 'PbD'].map((tag) => (
          <View key={tag} style={styles.complianceTag}>
            <Text style={styles.complianceTagTxt}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'principles', label: 'Principles' },
          { key: 'consent', label: 'Consent' },
          { key: 'audit', label: 'Audit Log' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabBtnTxt, tab === t.key && styles.tabBtnTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {tab === 'principles' && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTxt}>
                SmartSpend is built on 8 core security principles. These are not tick-boxes — they are
                architectural decisions baked into every layer of the system.
              </Text>
            </View>
            {PRINCIPLES.map((p, i) => (
              <View key={i} style={styles.principleCard}>
                <View style={styles.principleTop}>
                  <View style={styles.principleIconWrap}>
                    <MaterialCommunityIcons name={p.icon} size={22} color={THEME.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.principleHeadRow}>
                      <Text style={styles.principleTitle}>{p.title}</Text>
                      <View style={[styles.statusDot, { backgroundColor: p.statusColor }]} />
                    </View>
                    <View style={[styles.badge, { backgroundColor: p.badgeColor + '22' }]}>
                      <Text style={[styles.badgeTxt, { color: p.badgeColor }]}>{p.badge}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: p.statusColor + '22' }]}>
                    <Text style={[styles.statusPillTxt, { color: p.statusColor }]}>{p.status}</Text>
                  </View>
                </View>
                <Text style={styles.principleDesc}>{p.desc}</Text>
              </View>
            ))}
            <View style={styles.disclaimerBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MaterialCommunityIcons name="scale-balance" size={16} color={THEME.warning} />
                <Text style={styles.disclaimerTitle}>Regulatory Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerTxt}>
                SmartSpend provides spending analysis and advisory insights only. This application is
                not a regulated financial services provider. Insights are educational and informational
                — they do not constitute regulated financial advice. Always consult a licensed financial
                advisor before making major financial decisions.
              </Text>
            </View>
          </>
        )}

        {tab === 'consent' && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTxt}>
                You control how your data is used. Analytics consent is required for core functionality.
                All other consents are optional and can be changed at any time.
              </Text>
            </View>
            {[
              {
                key: 'analytics',
                icon: 'chart-bar',
                title: 'Analytics & Insights',
                desc: 'Required for health scoring, recommendations and spending analysis. Cannot be disabled while using the app.',
                required: true,
              },
              {
                key: 'personalization',
                icon: 'bullseye-arrow',
                title: 'Personalisation',
                desc: 'Allows SmartSpend to tailor recommendations based on your spending history and goal progress.',
                required: false,
              },
              {
                key: 'dataSharing',
                icon: 'link',
                title: 'Partner Data Sharing',
                desc: 'Share anonymised, aggregated spending insights with financial research partners. No personally identifiable data is ever shared.',
                required: false,
              },
              {
                key: 'marketing',
                icon: 'bullhorn',
                title: 'Marketing Communications',
                desc: 'Receive personalised offers and promotions based on your financial profile. You can opt out at any time.',
                required: false,
              },
            ].map((item) => (
              <View key={item.key} style={styles.consentCard}>
                <View style={styles.consentTop}>
                  <View style={styles.consentIconWrap}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={THEME.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.consentHeadRow}>
                      <Text style={styles.consentTitle}>{item.title}</Text>
                      {item.required && (
                        <View style={styles.requiredTag}>
                          <Text style={styles.requiredTagTxt}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.consentDesc}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={consent[item.key]}
                    onValueChange={() => toggleConsent(item.key)}
                    disabled={item.required}
                    trackColor={{ false: THEME.border, true: THEME.primary }}
                    thumbColor={consent[item.key] ? '#fff' : '#fff'}
                  />
                </View>
              </View>
            ))}
            <View style={styles.gdprNote}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MaterialCommunityIcons name="earth" size={16} color={THEME.info} />
                <Text style={styles.gdprNoteTitle}>Your GDPR Rights</Text>
              </View>
              <Text style={styles.gdprNoteTxt}>Right to access · Right to erasure · Right to portability · Right to rectification</Text>
              <Text style={styles.gdprNoteTxt}>To exercise your rights, contact: privacy@smartspend.bw</Text>
            </View>
          </>
        )}

        {tab === 'audit' && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTxt}>
                Every data access and action is logged immutably. This audit trail ensures full
                accountability and supports your right to know how your data was used.
              </Text>
            </View>
            {auditLog.map((entry) => (
              <View key={entry.id} style={styles.auditRow}>
                <View style={styles.auditIconWrap}>
                  <MaterialCommunityIcons name={entry.icon === 'check-circle' ? 'check-circle' : 'information'} size={18} color={THEME.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.auditAction}>{entry.action}</Text>
                  <Text style={styles.auditDetail}>{entry.detail}</Text>
                </View>
                <Text style={styles.auditTime}>{entry.time}</Text>
              </View>
            ))}
            <View style={styles.auditNote}>
              <MaterialCommunityIcons name="lock-outline" size={14} color={THEME.textLight} />
              <Text style={styles.auditNoteTxt}>Logs are append-only and tamper-evident. Stored for 90 days.</Text>
            </View>
          </>
        )}

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
  lockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.success + '33', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  lockTxt: { color: THEME.success, fontSize: 10, fontWeight: '700' },
  complianceStrip: { backgroundColor: THEME.darkMid, flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10, paddingHorizontal: 14 },
  complianceTag: { backgroundColor: '#ffffff15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  complianceTagTxt: { color: THEME.textLight, fontSize: 9, fontWeight: '600' },
  tabBar: { backgroundColor: THEME.card, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: THEME.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: THEME.primary },
  tabBtnTxt: { fontSize: 12, fontWeight: '600', color: THEME.textSub },
  tabBtnTxtActive: { color: THEME.primary },
  scroll: { padding: 14, gap: 10 },
  infoBox: { backgroundColor: THEME.primaryFade, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: THEME.primary },
  infoBoxTxt: { fontSize: 11, color: THEME.primaryDark, lineHeight: 17 },
  principleCard: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  principleTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  principleIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  principleHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  principleTitle: { fontSize: 13, fontWeight: '800', color: THEME.text, flex: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { fontSize: 9, fontWeight: '700' },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusPillTxt: { fontSize: 9, fontWeight: '700' },
  principleDesc: { fontSize: 11, color: THEME.textSub, lineHeight: 17 },
  disclaimerBox: { backgroundColor: THEME.warningFade, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.warning + '44' },
  disclaimerTitle: { fontSize: 13, fontWeight: '800', color: THEME.warning },
  disclaimerTxt: { fontSize: 11, color: THEME.text, lineHeight: 18 },
  consentCard: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  consentTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  consentIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  consentHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  consentTitle: { fontSize: 13, fontWeight: '700', color: THEME.text },
  consentDesc: { fontSize: 11, color: THEME.textSub, lineHeight: 16, marginTop: 2, paddingRight: 8 },
  requiredTag: { backgroundColor: THEME.infoFade, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  requiredTagTxt: { fontSize: 8, color: THEME.info, fontWeight: '700' },
  gdprNote: { backgroundColor: THEME.infoFade, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: THEME.info + '44' },
  gdprNoteTitle: { fontSize: 13, fontWeight: '800', color: THEME.info },
  gdprNoteTxt: { fontSize: 10, color: THEME.text, lineHeight: 16 },
  auditRow: { backgroundColor: THEME.card, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  auditIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  auditAction: { fontSize: 12, fontWeight: '700', color: THEME.text },
  auditDetail: { fontSize: 10, color: THEME.textSub, marginTop: 2, lineHeight: 15 },
  auditTime: { fontSize: 9, color: THEME.textLight, marginTop: 2 },
  auditNote: { flexDirection: 'row', gap: 6, backgroundColor: THEME.darkCard, borderRadius: 10, padding: 12 },
  auditNoteTxt: { flex: 1, fontSize: 10, color: THEME.textLight, lineHeight: 16 },
});
