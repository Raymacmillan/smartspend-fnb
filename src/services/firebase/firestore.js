import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const saveUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const getUserGoals = async (uid) => {
  const q = query(collection(db, 'goals'), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const saveGoal = async (uid, goal) => {
  await setDoc(doc(db, 'goals', `${uid}_${goal.id}`), { uid, ...goal });
};

export const removeGoal = async (uid, goalId) => {
  await deleteDoc(doc(db, 'goals', `${uid}_${goalId}`));
};

export const saveMonthlySnapshot = async (uid, month, data) => {
  await setDoc(doc(db, 'snapshots', `${uid}_${month}`), { uid, month, ...data, savedAt: new Date().toISOString() });
};

export default db;
