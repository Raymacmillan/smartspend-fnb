// Takes bankCharges category transactions and breaks them down by type
export const analyseCharges = (chargeTransactions, prevTotal) => {
  const breakdown = [];
  let total = 0;

  chargeTransactions.forEach((txn) => {
    total += txn.amount;
    const name = txn.name.toLowerCase();

    if (name.includes('service fee') || name.includes('monthly fee')) {
      breakdown.push({ ...txn, type: 'serviceFee', color: '#f5840c' });
    } else if (name.includes('atm')) {
      breakdown.push({ ...txn, type: 'atm', color: '#1565c0' });
    } else if (name.includes('interbank') || name.includes('transfer fee')) {
      breakdown.push({ ...txn, type: 'interbank', color: '#7b1fa2' });
    } else if (name.includes('sms')) {
      breakdown.push({ ...txn, type: 'sms', color: '#e53935' });
    } else {
      breakdown.push({ ...txn, type: 'other', color: '#777' });
    }
  });

  const diff = prevTotal ? total - prevTotal : 0;

  return { total, breakdown, diff };
};