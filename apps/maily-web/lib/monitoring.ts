export const MetricsService = {
  recordLatency: (name: string, latency: number) => {
    console.log(`[MetricsService] ${name}: ${latency}ms`);
  },
  recordError: (name: string, error: any) => {
    console.error(`[MetricsService] ${name}`, error);
  }
};

export default MetricsService; 