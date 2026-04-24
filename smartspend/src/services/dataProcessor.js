import { startOfMonth, subMonths, format, addMonths } from 'date-fns';

// Simple rules-based categorization for the hackathon
const getCategoryKey = (description) => {
  const desc = description.toUpperCase();
  if (desc.includes('AIRTIME')) return 'airtime';
  if (desc.includes('KFC') || desc.includes('NANDOS') || desc.includes('RESTAURANT')) return 'dining';
  if (desc.includes('ATM')) return 'atm';
  if (desc.includes('INTERBANK')) return 'interbank';
  if (desc.includes('SERVICE FEE') || desc.includes('FEE') || desc.includes('CHARGE') || desc.includes('VAT')) return 'bankCharges';
  if (desc.includes('CHECKERS') || desc.includes('SPAR')) return 'groceries';
  if (desc.includes('FUEL') || desc.includes('ENGEN')) return 'fuel';
  return 'other';
};

/**
 * Processes raw transactions from Firebase into structured data
 * for our components and analysis engines.
 * @param {Array} transactions - Raw transaction objects from Firebase
 * @param {Date} targetMonth - The target month to process
 * @returns {Object} - { categories, total, prevTotal }
 */
export const processTransactions = (transactions, targetMonth = new Date()) => {
  const categoryMap = new Map();
  let total = 0;
  let prevTotal = 0;

  const thisMonthStart = startOfMonth(targetMonth);
  const lastMonthStart = startOfMonth(subMonths(targetMonth, 1));
  const thisMonthEnd = startOfMonth(addMonths(targetMonth, 1));
  const lastMonthEnd = thisMonthStart;

  (Array.isArray(transactions) ? transactions : []).forEach(tx => {
    // Ensure amount is a number and date is a Date object
    const amount = Number(tx.amount) || 0;
    const date = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);

    // Skip invalid transactions
    if (!amount || isNaN(date.getTime())) return;

    const key = getCategoryKey(tx.description);
    const isAtm = key === 'atm';
    const feeAmount = isAtm ? 8.50 : 0;
    const totalTxAmount = amount + feeAmount;

    // 1. Aggregate totals for current and previous month
    if (date >= thisMonthStart && date < thisMonthEnd) {
      total += totalTxAmount;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          key,
          amount: 0,
          transactions: [],
        });
      }

      const category = categoryMap.get(key);
      category.amount += amount;
      category.transactions.push(tx);

      if (isAtm) {
        if (!categoryMap.has('bankCharges')) {
          categoryMap.set('bankCharges', { key: 'bankCharges', amount: 0, transactions: [] });
        }
        const bcCat = categoryMap.get('bankCharges');
        bcCat.amount += feeAmount;
        bcCat.transactions.push({
          ...tx, id: tx.id ? tx.id + '_fee' : Math.random().toString(), description: 'ATM WITHDRAWAL FEE (DERIVED)', amount: feeAmount
        });
      }
    } else if (date >= lastMonthStart && date < lastMonthEnd) {
      prevTotal += totalTxAmount;
    }
  });

  // Add a generic bank charges category if not present
  if (!categoryMap.has('bankCharges')) {
    categoryMap.set('bankCharges', { key: 'bankCharges', amount: 0, transactions: [] });
  }

  const categories = Array.from(categoryMap.values());

  const thisMonthLabel = format(targetMonth, 'MMMM yyyy');

  return {
    categories,
    total,
    prevTotal,
    label: thisMonthLabel,
  };
};