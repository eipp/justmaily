export const MetricsService = {
  log: (...args: any[]) => {
    console.log('[MetricsService]', ...args);
  }
};

export default MetricsService; 