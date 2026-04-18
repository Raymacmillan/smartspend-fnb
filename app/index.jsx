import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BottomNav from '../src/components/common/BottomNav';
import COLORS from '../src/constants/colors';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.fnb}>FNB</Text>
        <View style={styles.qr}>
          <Text style={styles.qrText}>▦</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <View>
              <Text style={styles.heroTitle}>Helpful.{'\n'}Easy. Safe.</Text>
              <Text style={styles.heroSub}>A new experience giving{'\n'}you the help you need.</Text>
            </View>
          </View>
          <View style={styles.deposit}>
            <Text style={styles.depositText}>Member of the Deposit Insurance Scheme of Botswana</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchSec}>
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}><Text style={styles.searchIconText}>🔍</Text></View>
            <Text style={styles.searchText}>How can we help you?</Text>
          </View>
        </View>

        {/* Icon grid */}
        <View style={styles.iconSec}>
          <View style={styles.iconRow}>
            <IconBtn icon="🔐" label="Login" color={COLORS.orange} />
            <IconBtn icon="🛍️" label="Product Shop" color={COLORS.orange} />
            <IconBtn icon="💸" label="Pay" color={COLORS.teal} />
            <IconBtn icon="🔄" label="Transfer" color={COLORS.teal} />
          </View>
          <View style={[styles.iconRow, { justifyContent: 'flex-start', paddingLeft: 14 }]}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/smartspend')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, styles.iconBoxSs]}>
                <Text style={styles.iconTxtSs}>📊</Text>
              </View>
              <Text style={styles.iconLabelSs}>SmartSpend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

function IconBtn({ icon, label, color }) {
  return (
    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Text style={[styles.iconTxt, { color }]}>{icon}</Text>
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  topBar: {
    backgroundColor: COLORS.black,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fnb: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  qr: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: { color: '#fff', fontSize: 16 },
  hero: { backgroundColor: '#e8f8f6', paddingVertical: 20 },
  heroInner: { padding: 16 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#111', lineHeight: 26 },
  heroSub: { fontSize: 12, color: '#555', marginTop: 6, lineHeight: 16 },
  deposit: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d8eeeb',
  },
  depositText: { fontSize: 11, color: '#444', fontStyle: 'italic', textAlign: 'center' },
  searchSec: { backgroundColor: COLORS.black, padding: 12 },
  searchBar: {
    backgroundColor: COLORS.black3,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  searchIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: { color: '#fff', fontSize: 14 },
  searchText: { color: '#888', fontSize: 13 },
  iconSec: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 16 },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 14,
  },
  iconBtn: { alignItems: 'center', gap: 6, width: 66 },
  iconBox: {
    width: 54,
    height: 54,
    backgroundColor: COLORS.black3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#363636',
  },
  iconBoxSs: {
    backgroundColor: COLORS.tealMid,
    borderColor: 'transparent',
  },
  iconTxt: { fontSize: 22 },
  iconTxtSs: { fontSize: 22, color: '#fff' },
  iconLabel: { color: '#ccc', fontSize: 9, textAlign: 'center', lineHeight: 12 },
  iconLabelSs: { color: COLORS.teal, fontSize: 9, fontWeight: '700', textAlign: 'center' },
});