// Format number as Pula with 2 decimal places — e.g. P 1,250.00
export const formatPula = (amount) => {
  return 'P ' + Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format without decimals — e.g. P 1,250
export const formatPulaShort = (amount) => {
  return 'P ' + Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Format as plain number with commas — e.g. 1,250
export const formatNumber = (amount) => {
  return Number(amount).toLocaleString('en-ZA');
};