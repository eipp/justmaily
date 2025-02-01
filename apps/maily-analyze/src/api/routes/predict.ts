import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { PredictService } from '../../services/PredictService';

export default async function predictRoutes(server: FastifyInstance) {
  server.get('/predict', async (request: FastifyRequest, reply: FastifyReply) => {
    const predictService = new PredictService();
    const prediction = await predictService.generatePrediction();
    return {
      prediction,
    };
  });
}