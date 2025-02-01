import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config, cleanup } from './config';
import contentRoutes from './api/routes/content';
import metricsRoutes from './api/routes/metrics';
import { AuthService } from './services/auth.service';
import { MetricsService } from './services/metrics.service';

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
          remotePort: request.socket.remotePort
        };
      }
    }
  }
});

// Register plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || true,
  credentials: true
});

app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    }
  }
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Register authentication decorator
app.decorate('authenticate', async (request: any, reply: any) => {
  const apiKey = request.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Register routes
app.register(async (fastify) => {
  await contentRoutes(fastify, config.contentService);
  await metricsRoutes(fastify, config.metrics);
}, { prefix: '/api/v1' });

// Health check route
app.get('/health', async () => {
  return { status: 'ok' };
});

// Request logging middleware
app.addHook('onRequest', async (request, reply) => {
  const startTime = process.hrtime();

  reply.hook('onSend', async (request, reply, payload) => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log request metrics
    app.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });

    // Record response time metrics if it's an AI operation
    if (request.url.startsWith('/api/v1/generate')) {
      config.metrics.recordLatency(
        'anthropic', // Default provider, should be extracted from request context
        'claude-3-sonnet-20240229',
        request.url.split('/').pop() || 'unknown',
        duration
      );
    }
  });
});

// Error handling
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  // Record error metrics for AI operations
  if (request.url.startsWith('/api/v1/generate')) {
    config.metrics.recordError(
      'anthropic', // Default provider, should be extracted from request context
      'claude-3-sonnet-20240229',
      error.name || 'unknown'
    );
  }

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    if (request.url.startsWith('/api/v1/generate')) {
      config.metrics.recordRateLimit(
        'anthropic',
        'claude-3-sonnet-20240229'
      );
    }

    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Please try again later'
    });
  }

  // Handle other errors
  const statusCode = error.statusCode || 500;
  const response = {
    error: error.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : error.message
  };

  return reply.status(statusCode).send(response);
});

// Graceful shutdown
const signals = ['SIGTERM', 'SIGINT'] as const;

for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, starting graceful shutdown`);

    try {
      await app.close();
      await cleanup();
      app.log.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      app.log.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
}

// Start server
const start = async () => {
  try {
    await app.listen({
      port: config.env.port,
      host: config.env.host
    });

    app.log.info(
      `Server listening on ${config.env.host}:${config.env.port} in ${config.env.nodeEnv} mode`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start(); 