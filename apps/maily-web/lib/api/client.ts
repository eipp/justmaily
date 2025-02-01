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