// apps/maily-optimize/src/api/routes/ab-test.ts
// API endpoint for creating A/B tests (/api/optimize/test)

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { OptimizationService } from '../../services/optimization.service'; // Import OptimizationService

const abTestSchema = z.object({
  campaignName: z.string(),
  variants: z.array(
    z.object({
      subject: z.string(),
      body: z.string(),
    })
  ).min(2),
  splitRatio: z.number().min(0).max(1),
});

type AbTestRequest = z.infer<typeof abTestSchema>;

interface CustomRouteOptions {
  optimizationService: OptimizationService;
}

async function abTestRoutes(server: FastifyInstance, options: CustomRouteOptions) {
  const { optimizationService } = options;

  server.post<{ Body: AbTestRequest }>('/test', {
    schema: {
      body: abTestSchema,
    },
    handler: async (request, reply) => {
      try {
        const { campaignName, variants, splitRatio } = request.body;

        // Call OptimizationService to create A/B test
        const result = await optimizationService.createABTest(campaignName, variants, splitRatio);

        reply.status(201).send({ message: 'A/B test creation initiated', campaignName, result });
      } catch (error) {
        console.error('Error in A/B test route:', error);
        reply.status(500).json({ error: 'Internal Server Error' });
      }
    },
  });
}

export default abTestRoutes;