import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { subscribeToAuth } from '../services/firebase/auth';

const initialState = {
  currentMonth: 'mar',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    default:
      return state;
  }
};

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch, user, authLoading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};