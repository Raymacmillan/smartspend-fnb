import KEYWORDS from './keywords';

// Takes a transaction name/description and returns a category key
export const categorise = (transactionName) => {
  const name = transactionName.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => name.includes(kw))) {
      return category;
    }
  }

  return 'other';
};