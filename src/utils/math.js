// Calculate percentage change between two values
export const percentChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Round to 2 decimal places
export const round2 = (num) => Math.round(num * 100) / 100;

// Calculate percentage of total
export const percentOfTotal = (amount, total) => {
  if (!total || total === 0) return 0;
  return Math.round((amount / total) * 100);
};