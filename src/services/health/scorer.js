// Standardised Financial Health Scorer — 0 to 100
// 4-Pillar System: Spending Control (30), Goal Progress (30),
//                  Fee Efficiency (20), Trend Stability (20)

export const calculateHealthScore = ({ categories = [], total = 0, goals = [], prevTotal = 0 } = {}) => {
  if (total === 0 && prevTotal === 0) {
    return {
      total: 100,
      breakdown: {
        spending: { label: 'Spending Control', score: 30, max: 30 },
        goals: { label: 'Goal Progress', score: 30, max: 30 },
        fees: { label: 'Fee Efficiency', score: 20, max: 20 },
        trend: { label: 'Trend Stability', score: 20, max: 20 }
      },
      helped: ['Clean slate!'],
      hurt: [],
      topAction: 'Start transacting to build your health score.'
    };
  }

  // 1. Spending Control (30 pts)
  // Evaluates Discretionary vs Essential spend
  const discretionarySpend = categories
    .filter(c => ['dining', 'airtime', 'other'].includes(c.key))
    .reduce((sum, c) => sum + c.amount, 0);

  const discRatio = total > 0 ? discretionarySpend / total : 0;
  let spendingScore = 30;
  if (discRatio > 0.5) spendingScore = 10;
  else if (discRatio > 0.3) spendingScore = 20;

  // 2. Goal Progress (30 pts)
  // Evaluates if the user is actively saving and making progress
  let goalScore = 30;
  if (goals && goals.length > 0) {
    const avgCompletion = goals.reduce((sum, g) => sum + Math.min(100, (g.saved / g.target) * 100), 0) / goals.length;
    if (avgCompletion >= 50) goalScore = 30;
    else if (avgCompletion >= 20) goalScore = 20;
    else goalScore = 10;
  } else {
    goalScore = 0; // Penalty for not having any financial goals set
  }

  // 3. Fee Efficiency (20 pts)
  // Evaluates leakage on avoidable bank charges
  const fees = categories
    .filter(c => ['bankCharges'].includes(c.key))
    .reduce((sum, c) => sum + c.amount, 0);
  
  const feeRatio = total > 0 ? fees / total : 0;
  let feeScore = 20;
  if (feeRatio > 0.05) feeScore = 0;
  else if (feeRatio > 0.015) feeScore = 10;

  // 4. Trend Stability (20 pts)
  // Evaluates month-on-month spending control
  let trendScore = 20;
  if (prevTotal > 0 && total > 0) {
    const increase = (total - prevTotal) / prevTotal;
    if (increase > 0.2) trendScore = 0;
    else if (increase > 0.05) trendScore = 10;
  }

  // Calculate final score out of 100
  const totalScore = spendingScore + goalScore + feeScore + trendScore;

  // Generate dynamic Insights
  const helped = [];
  const hurt = [];

  if (spendingScore === 30) helped.push('Low discretionary spend');
  else hurt.push('High discretionary spend');

  if (feeScore === 20) helped.push('Minimal bank fees');
  else hurt.push('High ATM & bank fees');

  if (trendScore === 20) helped.push('Spending kept stable');
  else hurt.push('Spending increased vs last month');

  if (goals && goals.length > 0 && goalScore >= 20) helped.push('On track with goals');
  else if (!goals || goals.length === 0) hurt.push('No active savings goals');

  // Determine the highest priority action for the user
  let topAction = 'Keep up the great financial habits!';
  if (feeScore < 20) topAction = 'Switch to app transfers and card swipes to reduce ATM and bank fees.';
  else if (spendingScore < 30) topAction = 'Cut back on dining and takeaways to boost your score.';
  else if (!goals || goals.length === 0) topAction = 'Set your first savings goal to instantly improve your score.';

  return {
    total: totalScore,
    breakdown: {
      spending: { score: spendingScore, max: 30, label: 'Spending Control' },
      goals: { score: goalScore, max: 30, label: 'Goal Progress' },
      fees: { score: feeScore, max: 20, label: 'Fee Efficiency' },
      trend: { score: trendScore, max: 20, label: 'Trend Stability' }
    },
    helped,
    hurt,
    topAction,
  };
};
