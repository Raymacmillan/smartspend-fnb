import { startOfMonth, subMonths, addMonths, format, min, max, eachMonthOfInterval } from 'date-fns';

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
  if (desc.includes('BPC') || desc.includes('ELECTRICITY')) return 'electricity';
  return 'other';
};

const CATEGORY_META = {
  airtime: { name: 'Airtime & Data', color: '#0ea5e9', emoji: '📱' },
  dining: { name: 'Dining & Takeout', color: '#f59e0b', emoji: '🍔' },
  atm: { name: 'ATM Withdrawals', color: '#64748b', emoji: '🏧' },
  interbank: { name: 'Interbank Transfers', color: '#8b5cf6', emoji: '🔄' },
  bankCharges: { name: 'Bank Charges', color: '#ef4444', emoji: '💳' },
  groceries: { name: 'Groceries', color: '#10b981', emoji: '🛒' },
  fuel: { name: 'Fuel & Transport', color: '#f43f5e', emoji: '⛽' },
  electricity: { name: 'Electricity & Water', color: '#eab308', emoji: '⚡' },
  other: { name: 'Other Expenses', color: '#94a3b8', emoji: '🏷️' }
};

export const getAvailableMonths = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [startOfMonth(new Date())];
  }
  const validDates = transactions
    .map(tx => tx.date?.toDate ? tx.date.toDate() : new Date(tx.date))
    .filter(d => !isNaN(d.getTime()));

  if (validDates.length === 0) return [startOfMonth(new Date())];

  const earliest = min(validDates);
  const current = new Date();
  const latest = max([...validDates, current]);

  return eachMonthOfInterval({ start: earliest, end: latest }).reverse();
};

/**
 * Processes raw transactions from Firebase into structured data
 * for our components and analysis engines.
 * @param {Array} transactions - Raw transaction objects from Firebase
 * @param {Date} targetMonth - The month to process data for
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
          name: CATEGORY_META[key]?.name || 'Other',
          color: CATEGORY_META[key]?.color || '#94a3b8',
          emoji: CATEGORY_META[key]?.emoji || '🏷️',
        });
      }

      const category = categoryMap.get(key);
      category.amount += amount;
      category.transactions.push(tx);

      // 3. Automatically extract derived ATM Fees into Bank Charges
      if (isAtm) {
        if (!categoryMap.has('bankCharges')) {
          categoryMap.set('bankCharges', { 
            key: 'bankCharges', amount: 0, transactions: [],
            name: CATEGORY_META['bankCharges'].name,
            color: CATEGORY_META['bankCharges'].color,
            emoji: CATEGORY_META['bankCharges'].emoji
          });
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
    categoryMap.set('bankCharges', { 
      key: 'bankCharges', amount: 0, transactions: [],
      name: CATEGORY_META['bankCharges'].name,
      color: CATEGORY_META['bankCharges'].color,
      emoji: CATEGORY_META['bankCharges'].emoji
    });
  }

  const categories = Array.from(categoryMap.values());

  const label = format(targetMonth, 'MMMM yyyy');

  return {
    categories,
    total,
    prevTotal,
    label,
  };
};