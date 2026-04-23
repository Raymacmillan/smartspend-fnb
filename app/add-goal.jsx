import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';

const DEADLINES = ['June 2025', 'September 2025', 'December 2025', 'March 2026', 'June 2026', 'December 2026'];
const ICONS = ['🏖️', '🚗', '🏠', '💻', '✈️', '🎓', '💍', '🏥', '🛡️', '🎯'];

export default function AddGoal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state, dispatch } = useStore();

  const existing = id ? state.goals.find((g) => g.id === Number(id)) : null;

  const [name, setName] = useState(existing?.name || '');
  const [target, setTarget] = useState(existing ? String(existing.target) : '');
  const [saved, setSaved] = useState(existing ? String(existing.saved) : '0');
  const [deadline, setDeadline] = useState(existing?.deadline || DEADLINES[0]);
  const [icon, setIcon] = useState(existing?.icon || ICONS[4]);
  const [error, setError] = useState('');

  const isEdit = !!existing;

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter a goal name.'); return; }
    if (!target || isNaN(Number(target)) || Number(target) <= 0) { setError('Please enter a valid target amount.'); return; }
    if (isNaN(Number(saved)) || Number(saved) < 0) { setError('Current savings must be 0 or more.'); return; }
    if (Number(saved) > Number(target)) { setError('Saved amount cannot exceed the target.'); return; }

    const goalData = {
      id: existing?.id || Date.now(),
      name: name.trim(),
      target: Number(target),
      saved: Number(saved),
      deadline,
      icon,
    };

    dispatch({ type: isEdit ? 'UPDATE_GOAL' : 'ADD_GOAL', payload: goalData });
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: Date.now(),
        action: isEdit ? 'Goal updated' : 'Goal created',
        detail: `${goalData.name} — target P${goalData.target}`,
        time: 'Just now',
        icon: '🎯',
      },
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Goal' : 'New Savings Goal'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnTxt}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Icon picker */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Goal Icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}
                  onPress={() => setIcon(ic)}
                >
                  <Text style={styles.iconBtnTxt}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Goal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. China Trip, Emergency Fund"
              placeholderTextColor={THEME.textLight}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              maxLength={40}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Target Amount (BWP) *</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPfx}>P</Text>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="10000"
                placeholderTextColor={THEME.textLight}
                keyboardType="numeric"
                value={target}
                onChangeText={(v) => { setTarget(v); setError(''); }}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Already Saved (BWP)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPfx}>P</Text>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="0"
                placeholderTextColor={THEME.textLight}
                keyboardType="numeric"
                value={saved}
                onChangeText={(v) => { setSaved(v); setError(''); }}
              />
            </View>
            {target && saved && Number(target) > 0 && (
              <View style={styles.progWrap}>
                <View style={styles.progTrack}>
                  <View style={[styles.progFill, { width: `${Math.min(100, Math.round((Number(saved) / Number(target)) * 100))}%` }]} />
                </View>
                <Text style={styles.progTxt}>{Math.min(100, Math.round((Number(saved) / Number(target)) * 100))}% complete</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Target Deadline</Text>
            <View style={styles.deadlineGrid}>
              {DEADLINES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.deadlineBtn, deadline === d && styles.deadlineBtnActive]}
                  onPress={() => setDeadline(d)}
                >
                  <Text style={[styles.deadlineBtnTxt, deadline === d && styles.deadlineBtnTxtActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnTxt}>{isEdit ? '✓ Update Goal' : '+ Create Goal'}</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900' },
  saveBtn: { backgroundColor: THEME.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll: { padding: 14, gap: 12 },
  card: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: THEME.textSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  iconBtnActive: { borderColor: THEME.primary, backgroundColor: THEME.primaryFade },
  iconBtnTxt: { fontSize: 22 },
  input: { backgroundColor: THEME.bg, borderRadius: 10, padding: 12, fontSize: 14, color: THEME.text, borderWidth: 1, borderColor: THEME.border },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencyPfx: { fontSize: 18, fontWeight: '700', color: THEME.primary },
  inputFlex: { flex: 1 },
  progWrap: { marginTop: 8, gap: 4 },
  progTrack: { height: 6, backgroundColor: THEME.border, borderRadius: 3 },
  progFill: { height: 6, backgroundColor: THEME.primary, borderRadius: 3 },
  progTxt: { fontSize: 10, color: THEME.textSub },
  deadlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deadlineBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: THEME.bg, borderWidth: 1, borderColor: THEME.border },
  deadlineBtnActive: { backgroundColor: THEME.primaryFade, borderColor: THEME.primary },
  deadlineBtnTxt: { fontSize: 11, color: THEME.textSub, fontWeight: '600' },
  deadlineBtnTxtActive: { color: THEME.primary },
  errorBox: { backgroundColor: THEME.dangerFade, borderRadius: 10, padding: 12 },
  errorTxt: { fontSize: 12, color: THEME.danger, fontWeight: '600' },
  primaryBtn: { backgroundColor: THEME.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
