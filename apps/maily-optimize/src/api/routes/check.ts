// apps/maily-optimize/src/api/routes/check.ts
// API endpoint for check content quality/spam (/api/optimize/check)

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { OptimizationService } from '../../services/optimization.service'; // Import OptimizationService

const checkContentSchema = z.object({
  emailContent: z.string(),
});

type CheckContentRequest = z.infer<typeof checkContentSchema>;

interface CustomRouteOptions {
  optimizationService: OptimizationService;
}

async function checkRoutes(server: FastifyInstance, options: CustomRouteOptions) {
  const { optimizationService } = options;

  server.post<{ Body: CheckContentRequest }>('/check', {
    schema: {
      body: checkContentSchema,
    },
    handler: async (request, reply) => {
      const { emailContent } = request.body;

      // Call OptimizationService to check content quality
      const result = await optimizationService.checkContentQuality(emailContent);

      reply.status(200).send({ message: 'Content check initiated', qualityScore: 0.8, isSpam: false, result });
    },
  });
}

export default checkRoutes;