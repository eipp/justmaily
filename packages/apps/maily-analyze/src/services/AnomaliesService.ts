export class AnomaliesService {
  async detectAnomalies() {
    // TODO: Implement logic to detect anomalies in campaign metrics
    return {
      anomalyId: 'anomaly123',
      status: 'detected',
      anomalies: [
        {
          metric: 'openRate',
          value: 0.1,
          expectedValue: 0.2,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  detectAnomalies(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }
    // Calculate the mean of the data
    const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
    // Define an arbitrary threshold (for example, 1.5 times the mean)
    const threshold = mean * 1.5;
    // Return values that significantly deviate above the mean
    return data.filter(val => val > threshold);
  }
}