import { FastifyInstance } from 'fastify';
import { AIMetrics } from '@justmaily/ai-core/monitoring/metrics';

export default async function metricsRoutes(
  fastify: FastifyInstance,
  metrics: AIMetrics
) {
  // Prometheus metrics endpoint
  fastify.get('/metrics', {
    schema: {
      response: {
        200: {
          type: 'string',
          description: 'Prometheus metrics in text format'
        }
      }
    }
  }, async (request, reply) => {
    const metricsData = await metrics.getMetrics();
    return reply
      .header('Content-Type', 'text/plain')
      .send(metricsData);
  });

  // Content generation metrics summary
  fastify.get('/metrics/content', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            requestRate: { type: 'number' },
            errorRate: { type: 'number' },
            avgLatency: { type: 'number' },
            cacheHitRate: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const contentMetrics = metrics.getContentMetrics();
    return reply.send(contentMetrics);
  });

  // Health metrics
  fastify.get('/health/metrics', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                errorRate: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    threshold: { type: 'number' },
                    current: { type: 'number' }
                  }
                },
                latency: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    threshold: { type: 'number' },
                    current: { type: 'number' }
                  }
                },
                cacheHealth: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    hitRate: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const contentMetrics = metrics.getContentMetrics();
    const errorRateThreshold = 0.1; // 10%
    const latencyThreshold = 5000; // 5 seconds

    const healthStatus = {
      status: 'healthy',
      checks: {
        errorRate: {
          status: contentMetrics.errorRate < errorRateThreshold ? 'healthy' : 'degraded',
          threshold: errorRateThreshold,
          current: contentMetrics.errorRate
        },
        latency: {
          status: contentMetrics.avgLatency < latencyThreshold ? 'healthy' : 'degraded',
          threshold: latencyThreshold,
          current: contentMetrics.avgLatency
        },
        cacheHealth: {
          status: contentMetrics.cacheHitRate > 0.3 ? 'healthy' : 'suboptimal',
          hitRate: contentMetrics.cacheHitRate
        }
      }
    };

    // Set overall status based on checks
    if (Object.values(healthStatus.checks).some(check => check.status === 'degraded')) {
      healthStatus.status = 'degraded';
    }

    return reply.send(healthStatus);
  });

  // Reset metrics (protected endpoint)
  fastify.post('/metrics/reset', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      }
    },
    onRequest: [fastify.authenticate] // Requires authentication middleware
  }, async (request, reply) => {
    await metrics.resetMetrics();
    return reply.send({ status: 'Metrics reset successfully' });
  });
} 