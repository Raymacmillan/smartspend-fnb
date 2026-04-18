// Scores a user's financial health out of 100
// Factors: saving consistency (25), charge efficiency (20),
//          discretionary spend (20), goal progress (20), spend consistency (15)

export const calculateHealthScore = (data) => {
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
  const goalScore = goals && goals.length > 0
    ? goals[0].saved > 0 ? 10 : 5
    : 5;

  // 5. Spend consistency (15pts) — compare to previous month
  const spendDiff = prevTotal ? Math.abs((total - prevTotal) / prevTotal) : 0;
  const consistencyScore = spendDiff < 0.05 ? 15 : spendDiff < 0.15 ? 10 : 6;

  const total_score = savingScore + chargeScore + discretionaryScore + goalScore + consistencyScore;

  return {
    total: total_score,
    breakdown: {
      savingConsistency: { score: savingScore, max: 25, label: 'Saving consistency' },
      chargeEfficiency: { score: chargeScore, max: 20, label: 'Charge efficiency' },
      discretionarySpend: { score: discretionaryScore, max: 20, label: 'Discretionary spend' },
      goalProgress: { score: goalScore, max: 20, label: 'Goal progress' },
      spendConsistency: { score: consistencyScore, max: 15, label: 'Spend consistency' },
    },
    helped: ['Consistent income', 'Regular groceries', 'No missed bills'],
    hurt: ['Frequent ATM use', 'High airtime fees', 'Dining increase'],
    topAction: 'Reduce ATM visits from 5 to 2 — could add +6 points next month',
  };
};