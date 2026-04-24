import { useEffect, useState } from 'react';
import { getGoals, saveGoal, updateGoal, deleteGoal } from '../services/firebase/firestore';

export const useGoals = (userId) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getGoals(userId);
    setGoals(data);
    setLoading(false);
  };

  const addGoal = async (goal) => {
    const ref = await saveGoal(userId, goal);
    await fetchGoals();
    return ref.id;
  };

  const editGoal = async (goalId, updates) => {
    await updateGoal(userId, goalId, updates);
    await fetchGoals();
  };

  const removeGoal = async (goalId) => {
    await deleteGoal(userId, goalId);
    await fetchGoals();
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  return { goals, loading, refetch: fetchGoals, addGoal, editGoal, removeGoal };
};