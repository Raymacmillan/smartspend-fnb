// Takes the current month's categories and returns recommendations
export const generateRecommendations = (categories) => {
  const recommendations = [];

  categories.forEach((cat) => {
    // Airtime: many small purchases
    if (cat.key === 'airtime' && cat.transactions.length >= 4) {
      const fees = cat.transactions.length * 1.50;
      const saving = round2(fees * 0.83);
      recommendations.push({
        id: 'airtime-consolidation',
        icon: 'phone',
        title: 'Frequent airtime purchases',
        subtitle: `${cat.transactions.length} purchases this month`,
        issue: `${cat.transactions.length} × small purchases`,
        estFees: `P ${fees.toFixed(2)}`,
        betterOption: '1 monthly P100 purchase',
        saving: `P ${saving.toFixed(2)}/month`,
        savingRaw: saving,
        severity: 'medium',
      });
    }

    // ATM: high withdrawal frequency
    if (cat.key === 'atm' && cat.transactions.length >= 4) {
      const fees = cat.transactions.length * 8.50;
      const saving = round2(fees * 0.60);
      recommendations.push({
        id: 'atm-reduction',
        icon: 'card',
        title: 'High ATM withdrawal frequency',
        subtitle: `${cat.transactions.length} withdrawals · P${fees.toFixed(2)} in fees`,
        issue: `${cat.transactions.length} ATM withdrawals`,
        estFees: `P ${fees.toFixed(2)}`,
        betterOption: 'Tap-to-pay or app transfers',
        saving: `P ${saving.toFixed(2)}/month`,
        savingRaw: saving,
        severity: 'high',
      });
    }

    // Dining: repeated food orders
    if (cat.key === 'dining' && cat.transactions.length >= 4) {
      const avg = round2(cat.amount / cat.transactions.length);
      const saving = round2(cat.amount * 0.30);
      recommendations.push({
        id: 'dining-reduction',
        icon: 'restaurant',
        title: 'Repeated food purchases',
        subtitle: `${cat.transactions.length} orders · avg P${avg} each`,
        issue: `${cat.transactions.length} food/delivery orders`,
        estFees: `P ${cat.amount.toFixed(2)}`,
        betterOption: 'Meal plan 3 days/week',
        saving: `P ${saving.toFixed(2)}/month`,
        savingRaw: saving,
        severity: 'medium',
      });
    }
  });

  // Sort by highest saving first
  recommendations.sort((a, b) => b.savingRaw - a.savingRaw);

  return recommendations;
};

const round2 = (n) => Math.round(n * 100) / 100;