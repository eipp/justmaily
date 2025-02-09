export const api = {
  monitoring: {
    async getApiMetrics() {
      const response = await fetch('/api/monitoring?type=api')
      if (!response.ok) {
        throw new Error('Failed to fetch API metrics')
      }
      return response.json()
    },

    async getDbMetrics() {
      const response = await fetch('/api/monitoring?type=db')
      if (!response.ok) {
        throw new Error('Failed to fetch database metrics')
      }
      return response.json()
    },

    async getCacheMetrics() {
      const response = await fetch('/api/monitoring?type=cache')
      if (!response.ok) {
        throw new Error('Failed to fetch cache metrics')
      }
      return response.json()
    },

    async getSearchMetrics() {
      const response = await fetch('/api/monitoring?type=search')
      if (!response.ok) {
        throw new Error('Failed to fetch search metrics')
      }
      return response.json()
    },

    async getAllMetrics() {
      const response = await fetch('/api/monitoring')
      if (!response.ok) {
        throw new Error('Failed to fetch all metrics')
      }
      return response.json()
    },
  },
}

export const apiClient = {
  analytics: {
    async getCampaignsDetailed() {
      // Return dummy data for campaigns
      return { items: [
        {
          id: '1',
          name: 'Campaign A',
          subject: 'Subject A',
          sentAt: new Date().toISOString(),
          totalRecipients: 1000,
          delivered: 950,
          opened: 500,
          clicked: 200,
          bounced: 50,
          unsubscribed: 10,
          openRate: 50,
          clickRate: 20,
          bounceRate: 5,
          unsubscribeRate: 1
        }
      ] };
    },
    async getCampaignsPerformance() {
      // Return dummy performance data
      return { data: [
        { name: 'Campaign A', openRate: 50, clickRate: 20, bounceRate: 5, unsubscribeRate: 1 }
      ] };
    }
  },
  get: () => {
    // TODO: implement GET request logic
    return Promise.resolve(null);
  },
  post: () => {
    // TODO: implement POST request logic
    return Promise.resolve(null);
  }
}; 