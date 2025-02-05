export const db = {
  query: async (query: string, params?: any) => {
    console.log('db query:', query, params);
    return [];
  }
};

export const cache = {
  get: async (key: string) => null,
  set: async (key: string, value: any) => { console.log('cache set:', key, value); }
};

export const search = {
  find: async (term: string) => {
    console.log('search find:', term);
    return [];
  }
};

export default { db, cache, search }; 