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

export default createBrowserClient; 