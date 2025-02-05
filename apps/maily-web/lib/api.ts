export const createAPIHandler = (handler: any) => {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

export default createAPIHandler; 