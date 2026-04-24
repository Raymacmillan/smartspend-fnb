import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config'; // Assuming you have a config file that exports your db instance

/**
 * Fetches all transactions for the currently logged-in user.
 * For the hackathon, we'll fetch all documents and filter in JS.
 */
export const getUserTransactions = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const transactionsRef = collection(db, `users/${user.uid}/transactions`);
  const snapshot = await getDocs(transactionsRef);

  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Fetches all goals for the currently logged-in user.
 */
export const getUserGoals = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const goalsRef = collection(db, `users/${user.uid}/goals`);
  const snapshot = await getDocs(goalsRef);

  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Real-time listener for user transactions.
 * Triggers whenever a new transaction is added.
 */
export const subscribeToUserTransactions = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No user logged in to subscribe to transactions');
    return () => {};
  }

  const transactionsRef = collection(db, `users/${user.uid}/transactions`);
  return onSnapshot(transactionsRef, (snapshot) => {
    const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(txs);
  });
};