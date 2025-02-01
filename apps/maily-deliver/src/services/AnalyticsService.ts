import db from '../lib/db';

const TIME_INTERVAL = 3600; // Named constant replacing magic number for time intervals

export class AnalyticsService {
  async getAnalyticsData() {
    // Encapsulate the database query logic
    const query = 'SELECT * FROM analytics_data';
    const data = await db.query(query);
    return data;
  }

  calculateTrends(data) {
    // Optimize trend calculation by operating on pre-fetched data
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    // Example: filter items where timestamp modulo TIME_INTERVAL is zero
    return data.filter(item => item.timestamp % TIME_INTERVAL === 0);
  }
} 