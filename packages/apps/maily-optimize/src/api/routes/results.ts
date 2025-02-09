// apps/maily-optimize/src/api/routes/results.ts
// API endpoint for get test results (/api/optimize/results)

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { OptimizationService } from '../../services/optimization.service'; // Import OptimizationService

const getTestResultsSchema = z.object({
  testId: z.string(),
});

type GetTestResultsRequest = z.infer<typeof getTestResultsSchema>;

interface CustomRouteOptions {
  optimizationService: OptimizationService;
}

async function resultsRoutes(server: FastifyInstance, options: CustomRouteOptions) {
  const { optimizationService } = options;

  server.get<{ Querystring: GetTestResultsRequest }>('/results', {
    schema: {
      querystring: getTestResultsSchema,
    },
    handler: async (request, reply) => {
      const { testId } = request.query;

      // Call OptimizationService to get test results
      const result = await optimizationService.getTestResults(testId);

      reply.status(200).send({ message: 'Test results retrieved', testId, results: result });
    },
  });
}

export default resultsRoutes;