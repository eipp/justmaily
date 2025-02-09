import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { MetricsService } from '../../services/MetricsService';

export default async function metricsRoutes(server: FastifyInstance) {
  server.get('/metrics', async (request, reply) => {
    const metricsService = new MetricsService();
    const metrics = await metricsService.getCampaignMetrics();
    return {
      metrics,
    };
  });
};