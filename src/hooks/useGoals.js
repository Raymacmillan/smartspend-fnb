import { useStore } from '../store';
import { calculateGoal } from '../services/goals/calculator';

export const useGoals = () => {
  const { state, dispatch } = useStore();

  const goalsWithCalc = state.goals.map((g) => ({
    ...g,
    ...calculateGoal(g),
  }));

  const totalSaved = state.goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = state.goals.reduce((sum, g) => sum + g.target, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const addGoal = (goal) => dispatch({ type: 'ADD_GOAL', payload: goal });
  const updateGoal = (goal) => dispatch({ type: 'UPDATE_GOAL', payload: goal });
  const deleteGoal = (id) => dispatch({ type: 'DELETE_GOAL', payload: id });

  return { goals: goalsWithCalc, totalSaved, totalTarget, overallPct, addGoal, updateGoal, deleteGoal };
};
