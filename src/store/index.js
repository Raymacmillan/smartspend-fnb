import React, { createContext, useContext, useReducer } from 'react';
import SAMPLE_TRANSACTIONS from '../data/sampleTransactions';

const initialState = {
  currentMonth: 'mar',
  transactions: SAMPLE_TRANSACTIONS,
  goals: [
    {
      id: 1,
      name: 'China Trip',
      target: 10000,
      saved: 1800,
      deadline: 'December 2025',
    },
  ],
  user: {
    name: 'Keabetswe',
    account: 'Cheque **** 4821',
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'SET_USER':
      return { ...state, user: action.payload };
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
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
};