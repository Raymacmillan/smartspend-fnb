import { useEffect, useState } from 'react';
import { getTransactions } from '../services/firebase/firestore';

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState({ feb: null, mar: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const all = await getTransactions(userId);

      // Group by month and category
      const grouped = { feb: null, mar: null };

      ['feb', 'mar'].forEach((monthKey) => {
        const monthTxns = all.filter((t) => t.month === monthKey);
        if (monthTxns.length === 0) return;

        const label = monthKey === 'mar' ? 'March 2025' : 'February 2025';
        const categoriesMap = {};

        monthTxns.forEach((txn) => {
          if (!categoriesMap[txn.categoryKey]) {
            categoriesMap[txn.categoryKey] = {
              key: txn.categoryKey,
              name: txn.categoryName,
              color: txn.categoryColor,
              emoji: txn.categoryEmoji,
              amount: 0,
              prevAmount: 0,
              transactions: [],
            };
          }
          categoriesMap[txn.categoryKey].amount += txn.amount;
          categoriesMap[txn.categoryKey].transactions.push({
            id: txn.id,
            name: txn.name,
            date: txn.date,
            amount: txn.amount,
          });
        });

        const categories = Object.values(categoriesMap);
        const total = categories.reduce((sum, c) => sum + c.amount, 0);

        grouped[monthKey] = { label, total, categories };
      });

      // Wire up prevAmount on March using Feb's data
      if (grouped.mar && grouped.feb) {
        grouped.mar.categories.forEach((cat) => {
          const prev = grouped.feb.categories.find((c) => c.key === cat.key);
          cat.prevAmount = prev ? prev.amount : 0;
        });
      }

      setTransactions(grouped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return { transactions, loading, error, refetch: fetchTransactions };
};