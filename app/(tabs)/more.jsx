import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import THEME from '../../src/constants/theme';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/services/firebase/config';

export default function More() {
  const router = useRouter();
  const { state, dispatch } = useStore();

  const handleSignOut = () => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    router.replace('/login');
  };

  const [realName, setRealName] = useState(state.user.name);

  useEffect(() => {
    if (auth?.currentUser) {
      getDoc(doc(db, 'users', auth.currentUser.uid)).then((snap) => {
        if (snap.exists() && snap.data().name) {
          setRealName(snap.data().name);
        }
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarTxt}>{realName ? realName[0] : 'U'}</Text></View>
        <View>
          <Text style={styles.name}>{realName}</Text>
          <Text style={styles.account}>{state.user.account} · {state.user.tier}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <MenuSection title="Features">
          <MenuItem icon="📊" label="Analytics" sub="Spending trends & health score" onPress={() => router.push('/(tabs)/analytics')} />
          <MenuItem icon="🎯" label="Goals" sub="Savings targets & progress" onPress={() => router.push('/(tabs)/goals')} />
          <MenuItem icon="💡" label="Recommendations" sub="Smart cost reduction tips" onPress={() => router.push('/smartspend/recommendations')} />
          <MenuItem icon="💳" label="Bank Charges" sub="Fee breakdown & savings" onPress={() => router.push('/smartspend/charges')} />
          <MenuItem icon="🔔" label="Notifications" sub="Alerts & spending warnings" onPress={() => router.push('/notifications')} />
        </MenuSection>

        <MenuSection title="Security & Compliance">
          <MenuItem icon="🔒" label="Security & Privacy Centre" sub="Encryption, consent, audit trail, RBAC" onPress={() => router.push('/security')} highlight />
          <MenuItem icon="🏗️" label="System Architecture" sub="How SmartSpend is built — all 7 layers" onPress={() => router.push('/architecture')} />
        </MenuSection>

        <MenuSection title="About SmartSpend">
          <MenuItem icon="🌍" label="Impact & Business Model" sub="How we are transforming financial health in Botswana" onPress={() => router.push('/smartspend/impact')} />
          <MenuItem icon="⚖️" label="Regulatory Disclaimer" sub="Advisory insights only — not regulated financial advice" onPress={() => {}} />
        </MenuSection>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>SmartSpend v2.0 · Built for Botswana</Text>
          <Text style={styles.footerTxt}>🔒 AES-256 · TLS 1.3 · GDPR-aligned</Text>
          <Text style={styles.footerTxt}>Advisory only · Not regulated financial advice</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function MenuItem({ icon, label, sub, onPress, highlight }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, highlight && styles.menuIconHighlight]}>
        <Text style={styles.menuIconTxt}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, highlight && styles.menuLabelHighlight]}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },
  name: { color: '#fff', fontSize: 16, fontWeight: '800' },
  account: { color: THEME.textLight, fontSize: 10, marginTop: 2 },
  scroll: { padding: 12, gap: 8 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 10, color: THEME.textSub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: THEME.card, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 0.5, borderBottomColor: THEME.divider },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  menuIconHighlight: { backgroundColor: THEME.primaryFade },
  menuIconTxt: { fontSize: 18 },
  menuLabel: { fontSize: 13, fontWeight: '600', color: THEME.text },
  menuLabelHighlight: { color: THEME.primaryDark },
  menuSub: { fontSize: 10, color: THEME.textSub, marginTop: 1 },
  menuArrow: { color: THEME.textLight, fontSize: 18 },
  signOut: { backgroundColor: THEME.dangerFade, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5', marginTop: 8 },
  signOutTxt: { color: THEME.danger, fontSize: 13, fontWeight: '700' },
  footer: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  footerTxt: { fontSize: 10, color: THEME.textLight },
});
