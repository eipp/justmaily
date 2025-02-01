import pino from 'pino';
import { config } from '../api/config';

export const logger = pino({
  level: config.monitoring.logLevel || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
  base: {
    env: config.env,
    service: 'maily-deliver',
  },
  mixin() {
    return {
      requestId: process.env.AWS_LAMBDA_REQUEST_ID,
    };
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
}); 