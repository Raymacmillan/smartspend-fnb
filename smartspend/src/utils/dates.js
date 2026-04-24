const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Estimate months remaining from a deadline string like "December 2025"
export const estimateMonthsRemaining = (deadline) => {
  const parts = deadline.split(' ');
  const monthIndex = MONTHS.indexOf(parts[0]);
  const year = parseInt(parts[1]) || 2025;
  if (monthIndex < 0) return 9;
  const now = new Date();
  return Math.max(1, (year - now.getFullYear()) * 12 + (monthIndex - now.getMonth()));
};

// Get current month label e.g. "March 2025"
export const getCurrentMonthLabel = () => {
  const now = new Date();
  return MONTHS[now.getMonth()] + ' ' + now.getFullYear();
};