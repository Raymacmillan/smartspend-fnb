// Scores a user's financial health out of 100
// Factors: saving consistency (25), charge efficiency (20),
//          discretionary spend (20), goal progress (20), spend consistency (15)

export const calculateHealthScore = (data) => {
  if (!data || !data.categories) return null;

  const { categories, total, goals, prevTotal } = data;

  const bankCharges = categories.find((c) => c.key === 'bankCharges');
  const atm = categories.find((c) => c.key === 'atm');
  const dining = categories.find((c) => c.key === 'dining');

  // 1. Saving consistency (25pts) — lower ATM usage = better
  const atmCount = atm ? atm.transactions.length : 0;
  const savingScore = atmCount <= 2 ? 25 : atmCount <= 4 ? 20 : 12;

  // 2. Charge efficiency (20pts) — lower charges relative to total = better
  const chargeRatio = bankCharges ? (bankCharges.amount / total) : 0;
  const chargeScore = chargeRatio < 0.01 ? 20 : chargeRatio < 0.02 ? 14 : 7;

  // 3. Discretionary spend ratio (20pts) — dining as % of total
  const diningRatio = dining ? (dining.amount / total) : 0;
  const discretionaryScore = diningRatio < 0.10 ? 20 : diningRatio < 0.15 ? 13 : 8;

  // 4. Goal progress (20pts)
  const activeGoal = goals && goals.length > 0 ? goals[0] : null;
  let goalScore = 5; // Default score if no goals
  if (activeGoal && activeGoal.target > 0) {
    const progressRatio = activeGoal.saved / activeGoal.target;
    goalScore = Math.min(Math.round(progressRatio * 20), 20);
  }

  // 5. Spend consistency (15pts) — compare to previous month
  const spendDiff = prevTotal ? Math.abs((total - prevTotal) / prevTotal) : 0;
  const consistencyScore = spendDiff < 0.05 ? 15 : spendDiff < 0.15 ? 10 : 6;

  const total_score = savingScore + chargeScore + discretionaryScore + goalScore + consistencyScore;

  const breakdown = {
    savingConsistency: { score: savingScore, max: 25, label: 'Saving consistency' },
    chargeEfficiency: { score: chargeScore, max: 20, label: 'Charge efficiency' },
    discretionarySpend: { score: discretionaryScore, max: 20, label: 'Discretionary spend' },
    goalProgress: { score: goalScore, max: 20, label: 'Goal progress' },
    spendConsistency: { score: consistencyScore, max: 15, label: 'Spend consistency' },
  };

  // Dynamically generate insights
  const helped = [];
  if (consistencyScore / 15 > 0.8) helped.push('Consistent month-on-month spending');
  if (chargeScore / 20 > 0.8) helped.push('Kept bank charges low');
  if (discretionaryScore / 20 > 0.8) helped.push('Controlled discretionary spending');
  if (helped.length === 0) helped.push("Data is still being analyzed");

  const hurt = [];
  if (savingScore / 25 < 0.6) hurt.push('Frequent ATM usage increased costs');
  if (chargeScore / 20 < 0.6) hurt.push('High bank charges relative to spend');
  if (discretionaryScore / 20 < 0.6) hurt.push('High spending on dining out');
  if (hurt.length === 0) hurt.push("No major issues detected this month");

  // Find the worst-performing category to generate a top action
  const sortedBreakdown = Object.values(breakdown).sort((a, b) => (a.score / a.max) - (b.score / b.max));
  const topActionItem = sortedBreakdown[0];
  let topAction = 'Review your spending habits for areas to improve.';
  if (topActionItem.label === 'Saving consistency') {
    topAction = `Reduce ATM visits from ${atmCount} to 2 to improve your score.`;
  } else if (topActionItem.label === 'Charge efficiency') {
    topAction = 'Look for ways to reduce bank charges, like using free transfer methods.';
  }

  return {
    total: total_score,
    breakdown,
    helped,
    hurt,
    topAction,
  };
};