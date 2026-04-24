import { batchSaveTransactions, saveGoal, saveUserProfile } from './firestore';
import SAMPLE_TRANSACTIONS from '../../data/sampleTransactions';

export const seedUserData = async (userId, displayName = 'Demo User') => {
  // 1. Profile
  await saveUserProfile(userId, {
    name: displayName,
    account: 'Cheque **** 4821',
    createdAt: new Date().toISOString(),
  });

  // 2. Flatten transactions from sample data for both months
  const allTransactions = [];
  ['feb', 'mar'].forEach((monthKey) => {
    const month = SAMPLE_TRANSACTIONS[monthKey];
    month.categories.forEach((cat) => {
      cat.transactions.forEach((txn) => {
        allTransactions.push({
          name: txn.name,
          amount: txn.amount,
          date: txn.date,
          month: monthKey,
          categoryKey: cat.key,
          categoryName: cat.name,
          categoryColor: cat.color,
          categoryEmoji: cat.emoji,
        });
      });
    });
  });

  await batchSaveTransactions(userId, allTransactions);

  // 3. Default goal
  await saveGoal(userId, {
    name: 'China Trip',
    target: 10000,
    saved: 1800,
    deadline: 'December 2025',
    createdAt: new Date().toISOString(),
  });

  return { transactionsSeeded: allTransactions.length };
};