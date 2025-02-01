// apps/maily-optimize/src/api/routes/schedule.ts
// API endpoint for schedule campaign (/api/optimize/schedule)

import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { OptimizationService } from '../../services/optimization.service'; // Import OptimizationService

const scheduleCampaignSchema = z.object({
  campaignName: z.string(),
  scheduleTime: z.string().datetime(), // Example: "2025-02-01T10:00:00Z"
});

type ScheduleCampaignRequest = z.infer<typeof scheduleCampaignSchema>;

interface CustomRouteOptions {
  optimizationService: OptimizationService;
}

async function scheduleRoutes(server: FastifyInstance, options: CustomRouteOptions) {
  const { optimizationService } = options;

  server.post<{ Body: ScheduleCampaignRequest }>('/schedule', {
    schema: {
      body: scheduleCampaignSchema,
    },
    handler: async (request, reply) => {
      const { campaignName, scheduleTime } = request.body;

      // Call OptimizationService to schedule campaign
      const result = await optimizationService.scheduleCampaign(campaignName, new Date(scheduleTime));

      reply.status(201).send({ message: 'Campaign schedule initiated', campaignName, scheduleTime, result });
    },
  });
}

export default scheduleRoutes;