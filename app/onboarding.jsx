import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../src/services/firebase/config';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Onboarding() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState({ analytics: true, personalization: true, dataSharing: false, marketing: false });
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  const toggleConsent = (key) => setConsent((c) => ({ ...c, [key]: !c[key] }));

  const handleFinish = async () => {
    const safeMobile = mobile.replace(/[^0-9]/g, '');
    if (safeMobile.length < 7) { Alert.alert('Invalid Number', 'Please enter a valid mobile number.'); return; }
    if (pin.length < 4) { Alert.alert('PIN too short', 'Please enter a 4-digit PIN.'); return; }
    if (pin !== pinConfirm) { Alert.alert('PIN mismatch', 'PINs do not match. Try again.'); return; }

    try {
      const email = `${safeMobile}@smartspend.fnb`;
      const password = `${pin}-smartspend`;

      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
        if (e.code && e.code.includes('email-already-in-use')) {
          Alert.alert('Number Registered', 'This mobile number is already registered. Please log in instead.');
          return;
        }
        throw e;
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name: name.trim() || 'Demo User',
        mobile: safeMobile,
        consent,
        createdAt: Timestamp.now(),
      });

      // Seed 45 mock transactions across Jan-Mar 2026
      const start = new Date(2026, 0, 1).getTime();
      const end = new Date(2026, 2, 31, 23, 59, 59).getTime();
      const templates = [
        { desc: 'KFC GABORONE', min: 40, max: 150 },
        { desc: 'CHECKERS AIRPORT JUNCTION', min: 300, max: 1200 },
        { desc: 'ORANGE AIRTIME TOPUP', min: 10, max: 50 },
        { desc: 'ATM WITHDRAWAL MAIN MALL', min: 100, max: 500 },
        { desc: 'ENGEN TSHOLOFELO', min: 150, max: 400 },
        { desc: 'BPC ELECTRICITY', min: 50, max: 200 },
      ];
      const txRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
      await Promise.all(
        Array.from({ length: 45 }).map(() => {
          const t = templates[Math.floor(Math.random() * templates.length)];
          const randomTime = start + Math.random() * (end - start);
          return addDoc(txRef, {
            description: t.desc,
            amount: Math.floor(Math.random() * (t.max - t.min)) + t.min,
            date: Timestamp.fromDate(new Date(randomTime)),
          });
        })
      );
      
      // Seed 3 mock goals for the demo so the fancy UI is populated!
      const goalsRef = collection(db, `users/${auth.currentUser.uid}/goals`);
      await Promise.all([
        addDoc(goalsRef, { title: 'Emergency Fund', name: 'Emergency Fund', target: 10000, current: 4500, saved: 4500, icon: 'shield-star', color: '#10b981', createdAt: Timestamp.now() }),
        addDoc(goalsRef, { title: 'Kasane Trip', name: 'Kasane Trip', target: 3500, current: 1200, saved: 1200, icon: 'airplane', color: '#3b82f6', createdAt: Timestamp.now() }),
        addDoc(goalsRef, { title: 'New Car Deposit', name: 'New Car Deposit', target: 20000, current: 3000, saved: 3000, icon: 'car', color: '#f59e0b', createdAt: Timestamp.now() })
      ]);

      dispatch({ type: 'SET_CONSENT', payload: consent });
      dispatch({ type: 'SET_ONBOARDED' });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      dispatch({
        type: 'ADD_AUDIT_LOG',
        payload: { id: Date.now(), action: 'Onboarding complete', detail: 'Account created, consent recorded', time: 'Just now', icon: '✅' },
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Setup Failed', error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.textLight} />
      </TouchableOpacity>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.stepWrap}>
            <MaterialCommunityIcons name="hand-wave" size={48} color={THEME.primary} style={{ textAlign: 'center' }} />
            <Text style={styles.heading}>Welcome to SmartSpend</Text>
            <Text style={styles.body}>
              SmartSpend analyses your spending patterns to help you save money, track goals, and improve your financial health.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Before you start</Text>
              <Text style={styles.infoText}>
                SmartSpend is an <Text style={styles.bold}>advisory tool</Text> — it provides personalised insights but is{' '}
                <Text style={styles.bold}>not a licensed financial adviser</Text>.
              </Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
              <Text style={styles.btnTxt}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepWrap}>
            <MaterialCommunityIcons name="shield-lock-outline" size={48} color={THEME.primary} style={{ textAlign: 'center' }} />
            <Text style={styles.heading}>Your data, your choice</Text>
            <Text style={styles.body}>
              We follow a <Text style={styles.bold}>privacy-by-design</Text> approach. Choose what you share.
            </Text>
            <View style={styles.consentCard}>
              <ConsentRow title="Analytics" sub="Allows SmartSpend to calculate your health score" value={consent.analytics} onToggle={() => toggleConsent('analytics')} required />
              <ConsentRow title="Personalisation" sub="Tailors recommendations to your spending patterns" value={consent.personalization} onToggle={() => toggleConsent('personalization')} />
              <ConsentRow title="Data sharing (3rd parties)" sub="Share anonymised data with partner merchants" value={consent.dataSharing} onToggle={() => toggleConsent('dataSharing')} />
              <ConsentRow title="Marketing" sub="Receive offers from SmartSpend partners" value={consent.marketing} onToggle={() => toggleConsent('marketing')} />
            </View>
            <Text style={styles.privacyNote}>
              🛡️ Encrypted at rest (AES-256) and in transit (TLS 1.3).
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
              <Text style={styles.btnTxt}>Accept & Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepWrap}>
            <MaterialCommunityIcons name="form-textbox-password" size={48} color={THEME.primary} style={{ textAlign: 'center' }} />
            <Text style={styles.heading}>Secure Your Profile</Text>
            <Text style={styles.body}>Enter your details and set a 4-digit PIN.</Text>
            <View style={styles.pinWrap}>
              <Text style={styles.pinLabel}>Your Name</Text>
              <TextInput style={styles.nameInput} value={name} onChangeText={setName} placeholder="e.g. Pako" placeholderTextColor={THEME.textLight} />
              <Text style={styles.pinLabel}>Mobile Number</Text>
              <TextInput style={styles.nameInput} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="e.g. 71234567" placeholderTextColor={THEME.textLight} />
              <Text style={styles.pinLabel}>Enter 4-digit PIN</Text>
              <TextInput style={styles.pinInput} value={pin} onChangeText={setPin} keyboardType="numeric" maxLength={4} secureTextEntry placeholder="••••" placeholderTextColor={THEME.textLight} />
              <Text style={styles.pinLabel}>Confirm PIN</Text>
              <TextInput style={styles.pinInput} value={pinConfirm} onChangeText={setPinConfirm} keyboardType="numeric" maxLength={4} secureTextEntry placeholder="••••" placeholderTextColor={THEME.textLight} />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnTxt}>Create Account →</Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConsentRow({ title, sub, value, onToggle, required }) {
  return (
    <View style={styles.consentRow}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.consentTitle}>{title}</Text>
          {required && <View style={styles.reqBadge}><Text style={styles.reqTxt}>Required</Text></View>}
        </View>
        <Text style={styles.consentSub}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={required ? undefined : onToggle} trackColor={{ true: THEME.primary, false: THEME.border }} thumbColor="#fff" disabled={required} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark, padding: 24 },
  backBtn: { position: 'absolute', top: 50, left: 24, zIndex: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive: { backgroundColor: THEME.primary, width: 24 },
  stepWrap: { flex: 1, justifyContent: 'center', gap: 16 },
  heading: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center' },
  body: { fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  bold: { color: '#fff', fontWeight: '700' },
  infoBox: { backgroundColor: THEME.darkCard, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: THEME.warning },
  infoTitle: { color: THEME.warning, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  infoText: { color: '#bbb', fontSize: 11, lineHeight: 17 },
  btn: { backgroundColor: THEME.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  consentCard: { backgroundColor: THEME.darkCard, borderRadius: 14, overflow: 'hidden' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#ffffff10' },
  consentTitle: { fontSize: 13, fontWeight: '700', color: '#fff' },
  consentSub: { fontSize: 10, color: '#888', marginTop: 2, lineHeight: 14 },
  reqBadge: { backgroundColor: THEME.primary + '33', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  reqTxt: { fontSize: 8, color: THEME.primary, fontWeight: '700' },
  privacyNote: { fontSize: 10, color: '#777', textAlign: 'center', lineHeight: 16 },
  pinWrap: { backgroundColor: THEME.darkCard, borderRadius: 14, padding: 16, gap: 8 },
  pinLabel: { fontSize: 11, color: '#888' },
  nameInput: { backgroundColor: THEME.dark, borderRadius: 10, borderWidth: 1, borderColor: '#333', color: '#fff', fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  pinInput: { backgroundColor: THEME.dark, borderRadius: 10, borderWidth: 1, borderColor: '#333', color: '#fff', fontSize: 22, textAlign: 'center', paddingVertical: 12, letterSpacing: 8 },
});