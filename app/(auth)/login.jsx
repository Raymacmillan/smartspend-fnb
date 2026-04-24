import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import THEME from '../../src/constants/theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../src/services/firebase/config';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['⌫','0','✓']];

export default function Login() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [mobile, setMobile] = useState('');
  const [entered, setEntered] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKey = async (k) => {
    if (loading) return;
    if (k === '⌫') { setEntered((p) => p.slice(0, -1)); return; }

    if (k === '✓') {
      const safeMobile = mobile.replace(/[^0-9]/g, '');
      if (!safeMobile) {
        Alert.alert('Required', 'Please enter your mobile number first.');
        setEntered('');
        return;
      }
      if (entered.length !== 4) {
        Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
        setEntered('');
        return;
      }

      setLoading(true);
      try {
        const email = `${safeMobile}@smartspend.fnb`;
        const password = `${entered}-smartspend`;

        await signInWithEmailAndPassword(auth, email, password);

        // Seed demo data if user has fewer than 20 transactions
        const txSnap = await getDocs(
          collection(db, `users/${auth.currentUser.uid}/transactions`)
        );
        if (txSnap.size < 20) {
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
        }
        
        // Seed mock goals to restore the fancy icons and UI if none exist
        const goalsSnap = await getDocs(collection(db, `users/${auth.currentUser.uid}/goals`));
        if (goalsSnap.empty) {
          const goalsRef = collection(db, `users/${auth.currentUser.uid}/goals`);
          await Promise.all([
            addDoc(goalsRef, { title: 'Emergency Fund', name: 'Emergency Fund', target: 10000, current: 4500, saved: 4500, icon: 'shield-star', color: '#10b981', createdAt: Timestamp.now() }),
            addDoc(goalsRef, { title: 'Kasane Trip', name: 'Kasane Trip', target: 3500, current: 1200, saved: 1200, icon: 'airplane', color: '#3b82f6', createdAt: Timestamp.now() }),
            addDoc(goalsRef, { title: 'New Car Deposit', name: 'New Car Deposit', target: 20000, current: 3000, saved: 3000, icon: 'car', color: '#f59e0b', createdAt: Timestamp.now() })
          ]);
        }

        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({
          type: 'ADD_AUDIT_LOG',
          payload: {
            id: Date.now(),
            action: 'Login',
            detail: 'PIN authentication successful',
            time: 'Just now',
            icon: '🔐',
          },
        });
        router.replace('/(tabs)');
      } catch (err) {
        console.error('Login error:', err);
        Alert.alert('Login Failed', 'Incorrect mobile number or PIN. Please try again.');
      } finally {
        setLoading(false);
        setEntered('');
      }
      return;
    }

    if (entered.length < 4) setEntered((p) => p + k);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.textLight} />
        </TouchableOpacity>

        <View style={styles.contentWrap}>
          <View style={styles.topSection}>
            <View style={styles.top}>
              <View style={styles.logoWrap}>
                <MaterialCommunityIcons name="chart-donut" size={34} color={THEME.primary} />
              </View>
              <Text style={styles.brand}>SmartSpend</Text>
              <Text style={styles.sub}>Enter your mobile number and PIN</Text>
            </View>
            <TextInput
              style={styles.mobileInput}
              placeholder="Mobile Number (e.g. 71234567)"
              placeholderTextColor="#666"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.pinDot, i < entered.length && styles.pinDotFilled]}
              />
            ))}
          </View>

          <View style={styles.keypad}>
            {KEYS.map((row, r) => (
              <View key={r} style={styles.keyRow}>
                {row.map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[
                      styles.key,
                      k === '✓' && styles.keyConfirm,
                      k === '⌫' && styles.keyDel,
                    ]}
                    onPress={() => handleKey(k)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.keyTxt, k === '✓' && styles.keyConfirmTxt]}>{k}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {loading && <ActivityIndicator color={THEME.primary} style={{ marginTop: 10 }} />}

          <View style={styles.securityBadge}>
            <Text style={styles.securityTxt}>🔒 PIN never stored in plaintext · Encrypted via Firebase Auth</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/onboarding')}>
            <Text style={styles.switchTxt}>New here? Create an account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  keyboardView: { flex: 1, width: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 24, zIndex: 10 },
  contentWrap: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  topSection: { width: '100%', alignItems: 'center', gap: 24 },
  top: { alignItems: 'center', gap: 8 },
  mobileInput: { backgroundColor: THEME.darkCard, color: '#fff', width: '100%', maxWidth: 280, borderRadius: 10, padding: 14, fontSize: 16, textAlign: 'center', borderWidth: 1, borderColor: '#333' },
  logoWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: THEME.primary + '22', borderWidth: 1.5, borderColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 26, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 13, color: THEME.textLight },
  dotsRow: { flexDirection: 'row', gap: 16 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#444', backgroundColor: 'transparent' },
  pinDotFilled: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  keypad: { gap: 12, width: '100%', maxWidth: 280 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  key: { width: 72, height: 72, borderRadius: 36, backgroundColor: THEME.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff15' },
  keyConfirm: { backgroundColor: THEME.primary },
  keyDel: { backgroundColor: 'transparent' },
  keyTxt: { fontSize: 22, color: '#fff', fontWeight: '600' },
  keyConfirmTxt: { fontSize: 20 },
  securityBadge: { backgroundColor: THEME.darkCard, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  securityTxt: { fontSize: 10, color: '#888', textAlign: 'center' },
  switchTxt: { color: THEME.primary, fontSize: 13, textAlign: 'center', fontWeight: '600' },
});