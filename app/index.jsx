import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import THEME from '../src/constants/theme';

export default function Splash() {
  const router = useRouter();
  const { state } = useStore();

  const handleStart = () => {
    if (!state.hasOnboarded) router.push('/onboarding');
    else if (!state.isAuthenticated) router.push('/login');
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="chart-donut" size={42} color={THEME.primary} />
        </View>
        <Text style={styles.brand}>SmartSpend</Text>
        <Text style={styles.tagline}>Your personal financial intelligence</Text>
      </View>

      <View style={styles.mid}>
        <Feature icon="brain" text="AI-driven spending insights" />
        <Feature icon="bullseye-arrow" text="Goal-based savings tracking" />
        <Feature icon="shield-lock-outline" text="Bank-grade security & privacy" />
        <Feature icon="chart-line-variant" text="Financial health scoring" />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.cta} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.ctaTxt}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          SmartSpend provides advisory insights only. Not regulated financial advice.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, text }) {
  return (
    <View style={styles.feature}>
      <MaterialCommunityIcons name={icon} size={24} color={THEME.textLight} style={styles.featureIcon} />
      <Text style={styles.featureTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark, justifyContent: 'space-between', padding: 28 },
  top: { alignItems: 'center', paddingTop: 32 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: THEME.primary + '22',
    borderWidth: 1.5, borderColor: THEME.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brand: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: THEME.textLight, marginTop: 6, textAlign: 'center' },
  mid: { gap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 32, textAlign: 'center' },
  featureTxt: { fontSize: 14, color: '#ccc', flex: 1 },
  bottom: { gap: 12, alignItems: 'center' },
  cta: {
    width: '100%', backgroundColor: THEME.primary,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { color: THEME.primary, fontSize: 13 },
  disclaimer: { fontSize: 10, color: THEME.textLight, textAlign: 'center', lineHeight: 15 },
});
