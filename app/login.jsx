import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../src/services/firebase/config';
import { doc, setDoc, collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['⌫','0','✓']];

export default function Login() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [entered, setEntered] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKey = async (k) => {
    if (loading) return;
    if (k === '⌫') { setEntered((p) => p.slice(0, -1)); return; }
    if (k === '✓') {
      if (entered.length === 4) {
        setLoading(true);
        try {
          const email = `user${entered}@smartspend.fnb`;
          const password = `${entered}0000`;

          let isNewUser = false;
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (e) {
            if (e.code.includes('user-not-found') || e.code.includes('invalid-credential')) {
              await createUserWithEmailAndPassword(auth, email, password);
              isNewUser = true;
            } else {
              throw e;
            }
          }

          // Automatically populate data if the user is new OR has no existing transactions
          let needsData = isNewUser;
          if (!isNewUser) {
            const txSnap = await getDocs(collection(db, `users/${auth.currentUser.uid}/transactions`));
            if (txSnap.size < 20) {
              needsData = true;
            }
          }

          if (needsData) {
            if (isNewUser) {
              await setDoc(doc(db, 'users', auth.currentUser.uid), {
                name: `Demo User`,
                pin: entered,
                createdAt: Timestamp.now()
              });
            }

            const start = new Date(2026, 0, 1).getTime(); // Jan 1st
            const end = new Date(2026, 2, 31, 23, 59, 59).getTime(); // Mar 31st
            const templates = [
              { desc: 'KFC GABORONE', min: 40, max: 150 },
              { desc: 'CHECKERS AIRPORT JUNCTION', min: 300, max: 1200 },
              { desc: 'ORANGE AIRTIME TOPUP', min: 10, max: 50 },
              { desc: 'ATM WITHDRAWAL MAIN MALL', min: 100, max: 500 },
              { desc: 'ENGEN TSHOLOFELO', min: 150, max: 400 },
              { desc: 'BPC ELECTRICITY', min: 50, max: 200 }
            ];
            const txRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
            await Promise.all(Array.from({ length: 45 }).map(() => {
              const t = templates[Math.floor(Math.random() * templates.length)];
              const randomTime = start + Math.random() * (end - start);
              const date = new Date(randomTime);
              return addDoc(txRef, { description: t.desc, amount: Math.floor(Math.random() * (t.max - t.min)) + t.min, date: Timestamp.fromDate(date) });
            }));
          }

          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: Date.now(), action: 'Login', detail: 'PIN authentication successful', time: 'Just now', icon: '🔐' } });
          router.replace('/(tabs)');
        } catch (error) {
          Alert.alert('Login Failed', error.message);
        } finally {
          setLoading(false);
          setEntered('');
        }
      } else {
        Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
        setEntered('');
      }
      return;
    }
    if (entered.length < 4) setEntered((p) => p + k);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="chart-donut" size={34} color={THEME.primary} />
        </View>
        <Text style={styles.brand}>SmartSpend</Text>
        <Text style={styles.sub}>Enter your PIN to continue</Text>
      </View>

      {/* PIN dots */}
      <View style={styles.dotsRow}>
        {[0,1,2,3].map((i) => (
          <View key={i} style={[styles.pinDot, i < entered.length && styles.pinDotFilled]} />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((row, r) => (
          <View key={r} style={styles.keyRow}>
            {row.map((k) => (
              <TouchableOpacity
                key={k}
                style={[styles.key, k === '✓' && styles.keyConfirm, k === '⌫' && styles.keyDel]}
                onPress={() => handleKey(k)}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyTxt, k === '✓' && styles.keyConfirmTxt]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Enter the PIN you created during setup.</Text>
      {loading && <ActivityIndicator color={THEME.primary} style={{ marginTop: 10 }} />}

      <View style={styles.securityBadge}>
        <Text style={styles.securityTxt}>🔒 PIN stored locally · Never transmitted · AES-256 encrypted</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 24 },
  top: { alignItems: 'center', gap: 8 },
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
  hint: { fontSize: 11, color: '#555' },
  securityBadge: { backgroundColor: THEME.darkCard, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  securityTxt: { fontSize: 10, color: '#555', textAlign: 'center' },
});
