import { createContext, useContext } from 'react';

export const StoreContext = createContext({});

export const store = {
  // Placeholder store data; add state and methods as needed
};

export const useStore = () => useContext(StoreContext); 