import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { AnomaliesService } from '../../services/AnomaliesService';

export default async function anomaliesRoutes(server: FastifyInstance) {
  server.get('/anomalies', async (request, reply) => {
    const anomaliesService = new AnomaliesService();
    const anomalies = await anomaliesService.detectAnomalies();
    return {
      anomalies,
    };
  });
};