import * as Sentry from '@sentry/node';
import { config } from '../api/config';
import { logger } from './logger';

if (config.monitoring.sentryDsn) {
  Sentry.init({
    dsn: config.monitoring.sentryDsn,
    environment: config.env,
    tracesSampleRate: 1.0,
    debug: config.env === 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
    ],
    beforeSend(event) {
      // Add environment context
      event.tags = {
        ...event.tags,
        environment: config.env,
        service: 'maily-deliver',
      };

      // Add request context if available
      if (process.env.AWS_LAMBDA_REQUEST_ID) {
        event.tags.requestId = process.env.AWS_LAMBDA_REQUEST_ID;
      }

      return event;
    },
  });

  logger.info('Sentry initialized');
} else {
  logger.warn('Sentry DSN not configured, error tracking disabled');
}

export const captureException = (error: Error, context?: Sentry.CaptureContext) => {
  if (config.monitoring.sentryDsn) {
    Sentry.captureException(error, context);
  } else {
    logger.error({ error, context }, 'Error captured (Sentry disabled)');
  }
};

export const captureMessage = (message: string, context?: Sentry.CaptureContext) => {
  if (config.monitoring.sentryDsn) {
    Sentry.captureMessage(message, context);
  } else {
    logger.info({ message, context }, 'Message captured (Sentry disabled)');
  }
};

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  if (config.monitoring.sentryDsn) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

export const setTag = (key: string, value: string) => {
  if (config.monitoring.sentryDsn) {
    Sentry.setTag(key, value);
  }
};

export const setUser = (user: Sentry.User | null) => {
  if (config.monitoring.sentryDsn) {
    Sentry.setUser(user);
  }
};

export const flush = async (timeout?: number) => {
  if (config.monitoring.sentryDsn) {
    return Sentry.flush(timeout);
  }
  return Promise.resolve(true);
};

export { Sentry }; 