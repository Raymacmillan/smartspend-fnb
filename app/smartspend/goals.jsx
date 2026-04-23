import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store';
import GoalCard from '../../src/components/goals/GoalCard';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function Goals() {
  const router = useRouter();
  const { state, dispatch } = useStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Goal-Based Saving</Text>
        <Text style={styles.subtitle}>Track your savings targets</Text>
      </View>

      <ScrollView>
        {state.goals.length === 0 ? (
          <Text style={styles.empty}>No goals yet.</Text>
        ) : (
          state.goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onView={() => router.push({ pathname: '/smartspend/goal-detail', params: { id: g.id } })}
              onEdit={() => router.push({ pathname: '/smartspend/add-goal', params: { id: g.id } })}
              onDelete={() => dispatch({ type: 'DELETE_GOAL', payload: g.id })}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/smartspend/add-goal')}
        >
          <Text style={styles.addBtnTxt}>+ Add New Goal</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
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
  empty: { textAlign: 'center', padding: 28, fontSize: 12, color: COLORS.muted },
  addBtn: {
    marginHorizontal: 12,
    marginTop: 6,
    padding: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnTxt: { color: COLORS.teal, fontSize: 12, fontWeight: '700' },
});