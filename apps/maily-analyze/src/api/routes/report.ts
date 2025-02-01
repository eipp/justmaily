import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { ReportService } from '../../services/ReportService';

export default async function reportRoutes(server: FastifyInstance) {
  server.get('/report', async (request, reply) => {
    const reportService = new ReportService();
    const report = await reportService.generateReport();
    return {
      report,
    };
  });
};