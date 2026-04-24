import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';
import { saveGoal, updateGoal } from '../../src/services/firebase/firestore'; 
import { auth } from '../../src/services/firebase/config';

export default function AddGoal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state, dispatch } = useStore();
  const editing = id ? state.goals.find((g) => g.id === parseInt(id)) : null;

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setTarget(String(editing.target));
      setSaved(String(editing.saved));
      setDeadline(editing.deadline);
    }
  }, [editing?.id]);

  const handleSave = async () => {
    if (!name || !target || !deadline) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
   const goalData = {
    name: name.trim(),
    target: parseFloat(target),
    saved: parseFloat(saved) || 0,
    deadline: deadline.trim(),
    userId: auth.currentUser.uid,
  };
  try {
    if (editing) {
      await updateGoal(auth.currentUser.uid, editing.id, goalData);
    } else {
      await saveGoal(auth.currentUser.uid, goalData);
    }
    router.push('/smartspend/goals');
  } catch (error) {
    Alert.alert('Error', 'Could not save goal. Try again.');
  }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Goals</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{editing ? 'Edit Goal' : 'Add New Goal'}</Text>
        <Text style={styles.subtitle}>Fill in your savings target</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Goal name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. China Trip" />

        <Text style={styles.label}>Target amount (P)</Text>
        <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="e.g. 10000" keyboardType="numeric" />

        <Text style={styles.label}>Amount already saved (P)</Text>
        <TextInput style={styles.input} value={saved} onChangeText={setSaved} placeholder="e.g. 1800" keyboardType="numeric" />

        <Text style={styles.label}>Deadline (e.g. December 2026)</Text>
        <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="e.g. December 2026" />

        <TouchableOpacity style={styles.cta} onPress={handleSave}>
          <Text style={styles.ctaTxt}>Save Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cta, styles.ctaDark]} onPress={() => router.push('/smartspend/goals')}>
          <Text style={styles.ctaTxt}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: COLORS.black, padding: 14, paddingBottom: 12 },
  back: { color: COLORS.teal, fontSize: 11, marginBottom: 5 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 10, marginTop: 2 },
  form: { padding: 14 },
  label: { fontSize: 10, color: COLORS.muted, marginBottom: 4 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 12,
  },
  cta: {
    padding: 12,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  ctaDark: { backgroundColor: COLORS.black },
  ctaTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
});