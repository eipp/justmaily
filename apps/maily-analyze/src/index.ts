import fastify from 'fastify';

import { loadConfig } from './api/config';
import anomaliesRoutes from './api/routes/anomalies';
import metricsRoutes from './api/routes/metrics';
import predictRoutes from './api/routes/predict';
import reportRoutes from './api/routes/report';

const startServer = async () => {
  const config = loadConfig();
  const server = fastify();

  // Register routes
  server.register(metricsRoutes, { prefix: '/api/analyze' });
  server.register(reportRoutes, { prefix: '/api/analyze' });
  server.register(predictRoutes, { prefix: '/api/analyze' });
  server.register(anomaliesRoutes, { prefix: '/api/analyze' });

  try {
    await server.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startServer();