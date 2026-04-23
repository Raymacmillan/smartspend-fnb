// Financial health scorer — 0 to 100
// Factors: saving consistency (25), charge efficiency (20),
//          discretionary spend (20), goal progress (20), spend consistency (15)

export const calculateHealthScore = (data) => {
  const { categories, total, goals, prevTotal } = data;

  const bankCharges = categories.find((c) => c.key === 'bankCharges');
  const atm = categories.find((c) => c.key === 'atm');
  const dining = categories.find((c) => c.key === 'dining');

  // 1. Saving consistency (25pts) — lower ATM usage = better
  const atmCount = atm ? atm.transactions.length : 0;
  const savingScore = atmCount <= 2 ? 25 : atmCount <= 4 ? 18 : 10;

  // 2. Charge efficiency (20pts) — lower charges relative to total = better
  const chargeRatio = bankCharges ? (bankCharges.amount / total) : 0;
  const chargeScore = chargeRatio < 0.01 ? 20 : chargeRatio < 0.02 ? 14 : 7;

  // 3. Discretionary spend ratio (20pts) — dining as % of total
  const diningRatio = dining ? (dining.amount / total) : 0;
  const discretionaryScore = diningRatio < 0.10 ? 20 : diningRatio < 0.15 ? 13 : 8;

  // 4. Goal progress (20pts) — based on average % completion across all goals
  let goalScore = 5;
  if (goals && goals.length > 0) {
    const avgCompletion = goals.reduce((sum, g) => sum + Math.min(100, (g.saved / g.target) * 100), 0) / goals.length;
    if (avgCompletion >= 50) goalScore = 20;
    else if (avgCompletion >= 25) goalScore = 15;
    else if (avgCompletion >= 10) goalScore = 10;
    else goalScore = 6;
  }

  // 5. Spend consistency (15pts) — compare to previous month
  const spendDiff = prevTotal ? Math.abs((total - prevTotal) / prevTotal) : 0;
  const consistencyScore = spendDiff < 0.05 ? 15 : spendDiff < 0.15 ? 10 : 6;

  const totalScore = savingScore + chargeScore + discretionaryScore + goalScore + consistencyScore;

  // Data-driven helped / hurt tags
  const helped = [];
  const hurt = [];

  if (savingScore >= 18) helped.push('Low ATM usage');
  else hurt.push(`Frequent ATM use (${atmCount} visits)`);

  if (chargeScore >= 14) helped.push('Low bank charge ratio');
  else hurt.push('High bank charges vs spending');

  if (discretionaryScore >= 13) helped.push('Controlled dining spend');
  else hurt.push(`High dining spend (${Math.round(diningRatio * 100)}% of total)`);

  if (goalScore >= 15) helped.push('Strong savings goal progress');
  else hurt.push('Savings goals need more contributions');

  if (consistencyScore >= 10) helped.push('Consistent monthly spending');
  else hurt.push('Spend jumped vs last month');

  if (helped.length === 0) helped.push('Expenses are being tracked');
  if (hurt.length === 0) hurt.push('Minor areas for improvement');

  // Data-driven top action — target the worst-scoring factor
  const factors = [
    { score: savingScore, max: 25, action: `Reduce ATM visits from ${atmCount} to 2 to improve saving consistency` },
    { score: chargeScore, max: 20, action: 'Use FNB-to-FNB transfers — they are free and cut interbank fees' },
    { score: discretionaryScore, max: 20, action: 'Meal prep 3 days/week to cut dining spend by 20%' },
    { score: goalScore, max: 20, action: 'Set up a monthly auto-transfer to your savings goals' },
    { score: consistencyScore, max: 15, action: 'Keep spending within 5% of last month\'s budget' },
  ];
  const worst = factors.reduce((w, f) => (f.score / f.max) < (w.score / w.max) ? f : w);
  const topAction = `${worst.action} — could add up to +${worst.max - worst.score} points next month`;

  return {
    total: totalScore,
    breakdown: {
      savingConsistency: { score: savingScore, max: 25, label: 'Saving consistency' },
      chargeEfficiency: { score: chargeScore, max: 20, label: 'Charge efficiency' },
      discretionarySpend: { score: discretionaryScore, max: 20, label: 'Discretionary spend' },
      goalProgress: { score: goalScore, max: 20, label: 'Goal progress' },
      spendConsistency: { score: consistencyScore, max: 15, label: 'Spend consistency' },
    },
    helped,
    hurt,
    topAction,
  };
};
