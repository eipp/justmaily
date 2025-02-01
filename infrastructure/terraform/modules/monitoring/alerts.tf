resource "kubernetes_config_map" "prometheus_rules" {
  metadata {
    name      = "prometheus-ai-rules"
    namespace = "monitoring"
    labels = {
      "app.kubernetes.io/name" = "prometheus"
      "prometheus_rule"        = "true"
    }
  }

  data = {
    "ai-service-rules.yaml" = yamlencode({
      groups = [
        {
          name = "ai_service_alerts"
          rules = [
            {
              alert = "HighErrorRate"
              expr  = "sum(rate(ai_errors_total[5m])) by (provider, model) / sum(rate(ai_requests_total[5m])) by (provider, model) > ${var.alert_configs.high_error_rate.threshold}"
              for   = var.alert_configs.high_error_rate.duration
              labels = {
                severity = var.alert_configs.high_error_rate.severity
                channel  = var.alert_configs.high_error_rate.channel
              }
              annotations = {
                summary     = "High error rate detected for {{ $labels.provider }} - {{ $labels.model }}"
                description = "Error rate is {{ $value | humanizePercentage }} (threshold: ${var.alert_configs.high_error_rate.threshold * 100}%)"
              }
            },
            {
              alert = "HighLatency"
              expr  = "rate(ai_request_duration_seconds_sum[5m]) / rate(ai_request_duration_seconds_count[5m]) * 1000 > ${var.alert_configs.high_latency.threshold}"
              for   = var.alert_configs.high_latency.duration
              labels = {
                severity = var.alert_configs.high_latency.severity
                channel  = var.alert_configs.high_latency.channel
              }
              annotations = {
                summary     = "High latency detected for {{ $labels.provider }} - {{ $labels.model }}"
                description = "Average latency is {{ $value | humanizeDuration }} (threshold: ${var.alert_configs.high_latency.threshold}ms)"
              }
            },
            {
              alert = "LowCacheHitRate"
              expr  = "sum(rate(ai_cache_hits_total[15m])) / (sum(rate(ai_cache_hits_total[15m])) + sum(rate(ai_cache_misses_total[15m]))) < ${var.alert_configs.low_cache_hit_rate.threshold}"
              for   = var.alert_configs.low_cache_hit_rate.duration
              labels = {
                severity = var.alert_configs.low_cache_hit_rate.severity
                channel  = var.alert_configs.low_cache_hit_rate.channel
              }
              annotations = {
                summary     = "Low cache hit rate detected"
                description = "Cache hit rate is {{ $value | humanizePercentage }} (threshold: ${var.alert_configs.low_cache_hit_rate.threshold * 100}%)"
              }
            },
            {
              alert = "HighTokenUsage"
              expr  = "sum(rate(ai_tokens_total[5m])) by (provider) > 0.8 * ${var.token_quota}"
              for   = "15m"
              labels = {
                severity = "warning"
                channel  = "#alerts-warning"
              }
              annotations = {
                summary     = "High token usage for {{ $labels.provider }}"
                description = "Token usage is approaching quota limit (80% of ${var.token_quota} tokens/minute)"
              }
            },
            {
              alert = "FrequentRateLimiting"
              expr  = "sum(rate(ai_rate_limits_total[5m])) by (provider, model) > 0"
              for   = "5m"
              labels = {
                severity = "warning"
                channel  = "#alerts-warning"
              }
              annotations = {
                summary     = "Frequent rate limiting for {{ $labels.provider }} - {{ $labels.model }}"
                description = "Service is hitting rate limits frequently"
              }
            },
            {
              alert = "ModelFailureRate"
              expr  = "sum(rate(ai_requests_total{status='error'}[5m])) by (model) / sum(rate(ai_requests_total[5m])) by (model) > 0.1"
              for   = "10m"
              labels = {
                severity = "critical"
                channel  = "#alerts-critical"
              }
              annotations = {
                summary     = "High failure rate for model {{ $labels.model }}"
                description = "Model failure rate is {{ $value | humanizePercentage }}"
              }
            }
          ]
        }
      ]
    })
  }
} 