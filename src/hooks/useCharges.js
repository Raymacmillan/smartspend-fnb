import { useStore } from '../store';
import { analyseCharges } from '../services/charges/analyser';
import { MONTHS_ORDER } from '../data/sampleTransactions';

export const useCharges = () => {
  const { state } = useStore();
  const { currentMonth, transactions } = state;
  const m = transactions[currentMonth];
  const prevKey = MONTHS_ORDER[MONTHS_ORDER.indexOf(currentMonth) - 1] || null;
  const prev = prevKey ? transactions[prevKey] : null;

  const chargesCat = m.categories.find((c) => c.key === 'bankCharges');
  const prevChargesCat = prev?.categories.find((c) => c.key === 'bankCharges');
  const atmCat = m.categories.find((c) => c.key === 'atm');

  const { total, breakdown, diff } = analyseCharges(
    chargesCat?.transactions || [],
    prevChargesCat?.amount || 0
  );
  const atmFees = atmCat ? atmCat.transactions.length * 8.50 : 0;

  return {
    total,
    breakdown,
    diff,
    atmCat,
    atmFees,
    totalWithAtm: total + atmFees,
  };
};
