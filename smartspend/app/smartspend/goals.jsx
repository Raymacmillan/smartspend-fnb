import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGoals } from '../../src/hooks/useGoals';
import { auth } from '../../src/services/firebase/config';
import GoalCard from '../../src/components/goals/GoalCard';
import BottomNav from '../../src/components/common/BottomNav';
import COLORS from '../../src/constants/colors';

export default function Goals() {
  const router = useRouter();
  
  // Directly subscribe to Firestore via the custom hook
  // This makes the component 'reactive' to database changes
  const { goals, loading, removeGoal } = useGoals(auth.currentUser?.uid);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loaderText}>Syncing with SmartSpend...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Overview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Goal-Based Saving</Text>
        <Text style={styles.subtitle}>Track your savings targets</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No goals yet.</Text>
            <Text style={styles.emptySub}>Start saving for a trip to Kasane or a new laptop.</Text>
          </View>
        ) : (
          goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onView={() => router.push({ 
                pathname: '/smartspend/goal-detail', 
                params: { id: g.id } 
              })}
              onEdit={() => router.push({ 
                pathname: '/smartspend/add-goal', 
                params: { id: g.id } 
              })}
              // Reusable logic: Use the removeGoal function from our hook
              onDelete={() => removeGoal(g.id)}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/smartspend/add-goal')}
        >
          <Text style={styles.addBtnTxt}>+ Add New Goal</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loaderText: { marginTop: 12, fontSize: 12, color: COLORS.muted },
  emptyContainer: { padding: 40, alignItems: 'center' },
  empty: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: COLORS.text },
  emptySub: { textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 4 },
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