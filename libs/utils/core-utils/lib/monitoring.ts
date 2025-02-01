// @ts-expect-error - Temporary workaround for missing OTel types
import { Counter, Histogram, Meter } from '@opentelemetry/api'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { Resource } from '@opentelemetry/resources'
import { MeterProvider, MetricReader } from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import * as Sentry from '@sentry/node'
import pino from 'pino'
import { StatsD } from 'statsd-client'

import { config } from '../config'

// Add statsd client instance at module level
const statsd = new StatsD({
  host: config.monitoring.statsd.host,
  port: config.monitoring.statsd.port
});

// Add proper type declarations
import type { 
  ObservableGauge 
} from '@opentelemetry/api';

export class MetricsService {
  private static instance: MetricsService;
  private metrics = new Map<string, number>();

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  record(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }

  increment(counter: string): void {
    const current = this.metrics.get(counter) || 0;
    this.metrics.set(counter, current + 1);
  }
}

export function trackProviderPerformance(
  provider: string,
  metrics: {
    duration: number;
    result: 'success'|'throttled'|'permanent_error'|'temporary_error';
  }
) {
  statsd.timing(`email.provider.${provider}.duration`, metrics.duration);
  statsd.increment(`email.provider.${provider}.${metrics.result}`);
}
