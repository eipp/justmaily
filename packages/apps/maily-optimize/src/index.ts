import fastify from 'fastify';

import { loadConfig } from './api/config';
import abTestRoutes from './api/routes/ab-test';
import checkRoutes from './api/routes/check';
import resultsRoutes from './api/routes/results';
import scheduleRoutes from './api/routes/schedule';
import { OptimizationService } from './services/optimization.service'; // Import OptimizationService using named import

const startServer = async () => {
  const config = loadConfig();
  const server = fastify();

  // Instantiate OptimizationService
  const optimizationService = new OptimizationService();

  // Register routes and pass OptimizationService instance
  server.register(abTestRoutes, { prefix: '/api/optimize', optimizationService });
  server.register(scheduleRoutes, { prefix: '/api/optimize', optimizationService });
  server.register(checkRoutes, { prefix: '/api/optimize', optimizationService });
  server.register(resultsRoutes, { prefix: '/api/optimize', optimizationService });

  try {
    await server.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startServer();