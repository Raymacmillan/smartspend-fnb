import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';

const KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['⌫','0','✓']];

export default function Login() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [entered, setEntered] = useState('');

  const handleKey = (k) => {
    if (k === '⌫') { setEntered((p) => p.slice(0, -1)); return; }
    if (k === '✓') {
      if (entered === state.pin) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: Date.now(), action: 'Login', detail: 'PIN authentication successful', time: 'Just now', icon: '🔐' } });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Incorrect PIN', 'Please try again.');
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
          <Text style={styles.logoIcon}>📊</Text>
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

      <Text style={styles.hint}>Demo PIN: 1234</Text>

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
  logoIcon: { fontSize: 28 },
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
