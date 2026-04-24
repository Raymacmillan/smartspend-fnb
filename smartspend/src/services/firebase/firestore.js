import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// ── TRANSACTIONS ───────────────────────────────────────────────
export const saveTransaction = async (userId, transaction) => {
  const ref = collection(db, 'users', userId, 'transactions');
  return await addDoc(ref, transaction);
};

export const getTransactions = async (userId) => {
  const ref = collection(db, 'users', userId, 'transactions');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const batchSaveTransactions = async (userId, transactions) => {
  const batch = writeBatch(db);
  const ref = collection(db, 'users', userId, 'transactions');
  transactions.forEach((txn) => {
    const docRef = doc(ref);
    batch.set(docRef, txn);
  });
  await batch.commit();
};

// ── GOALS ──────────────────────────────────────────────────────
export const saveGoal = async (userId, goal) => {
  const ref = collection(db, 'users', userId, 'goals');
  return await addDoc(ref, goal);
};

export const getGoals = async (userId) => {
  const ref = collection(db, 'users', userId, 'goals');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateGoal = async (userId, goalId, updates) => {
  const ref = doc(db, 'users', userId, 'goals', goalId);
  await updateDoc(ref, updates);
};

export const deleteGoal = async (userId, goalId) => {
  const ref = doc(db, 'users', userId, 'goals', goalId);
  await deleteDoc(ref);
};

// ── USER PROFILE ───────────────────────────────────────────────
export const saveUserProfile = async (userId, profile) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, profile, { merge: true });
};

export const getUserProfile = async (userId) => {
  const ref = doc(db, 'users', userId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};