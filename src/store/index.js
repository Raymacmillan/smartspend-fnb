import React, { createContext, useContext, useReducer } from 'react';
import SAMPLE_TRANSACTIONS from '../data/sampleTransactions';

const initialState = {
  // Auth & onboarding
  hasOnboarded: false,
  isAuthenticated: false,
  pin: '1234',

  // Data
  currentMonth: 'mar',
  transactions: SAMPLE_TRANSACTIONS,
  goals: [],
  user: { name: 'Keabetswe', account: '**** 4821', tier: 'Cheque Account' },

  // Privacy & consent
  consent: {
    analytics: true,
    personalization: true,
    dataSharing: false,
    marketing: false,
  },

  // Notifications
  notifications: [
    { id: 1, type: 'warning', title: 'Dining spend up 18%', body: 'You\'ve spent P544 on dining this month — 18% more than February. Consider meal-prepping 3 days/week.', time: '2h ago', read: false },
    { id: 2, type: 'alert', title: 'ATM fees approaching limit', body: '5 ATM withdrawals this month. Switch to tap-to-pay and save P25.50/month.', time: '1d ago', read: false },
    { id: 3, type: 'success', title: 'Health score improved!', body: 'Your financial health score improved since January. Keep reducing ATM visits.', time: '2d ago', read: true },
    { id: 4, type: 'info', title: 'China Trip goal update', body: 'You are 18% of the way to your China Trip goal. Save P834/month to meet your December deadline.', time: '3d ago', read: true },
    { id: 5, type: 'warning', title: 'Monthly service fee charged', body: 'P28.50 monthly service fee has been debited from your account.', time: '4d ago', read: true },
  ],

  // Audit log
  auditLog: [
    { id: 1, action: 'Login', detail: 'PIN authentication successful', time: 'Today 09:14', icon: '🔐' },
    { id: 2, action: 'Data access', detail: 'Transaction data retrieved — March 2025', time: 'Today 09:14', icon: '📂' },
    { id: 3, action: 'Analytics run', detail: 'Health score calculated from spending data', time: 'Today 09:15', icon: '📊' },
    { id: 4, action: 'Goal updated', detail: 'China Trip — contribution recorded', time: 'Yesterday 14:22', icon: '🎯' },
    { id: 5, action: 'Consent confirmed', detail: 'Analytics consent accepted by user', time: 'Mar 1, 2025', icon: '✅' },
    { id: 6, action: 'Data minimised', detail: 'Raw transaction data stripped — categories only retained', time: 'Mar 1, 2025', icon: '🛡️' },
  ],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ONBOARDED':
      return { ...state, hasOnboarded: true };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CONSENT':
      return { ...state, consent: { ...state.consent, ...action.payload } };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog].slice(0, 20),
      };
    default:
      return state;
  }
};

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
