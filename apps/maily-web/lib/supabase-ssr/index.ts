export const createBrowserClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({}),
      signInWithOAuth: async () => ({}),
      signUp: async () => ({}),
      signOut: async () => ({}),
      updateUser: async () => ({})
    }
  };
};

// Adding default export to support both named and default imports
export default createBrowserClient; 