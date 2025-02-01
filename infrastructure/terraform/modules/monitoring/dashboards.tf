locals {
  dashboards = {
    ai_service_overview = {
      title = "AI Service Overview"
      panels = [
        {
          title = "Request Rate"
          type  = "graph"
          query = "sum(rate(ai_requests_total[5m])) by (provider, model)"
        },
        {
          title = "Error Rate"
          type  = "graph"
          query = "sum(rate(ai_errors_total[5m])) by (provider, model) / sum(rate(ai_requests_total[5m])) by (provider, model)"
        },
        {
          title = "Latency Distribution"
          type  = "heatmap"
          query = "rate(ai_request_duration_seconds_bucket[5m])"
        },
        {
          title = "Token Usage"
          type  = "graph"
          query = "sum(rate(ai_tokens_total[5m])) by (provider, model, type)"
        }
      ]
    }
    cache_performance = {
      title = "Cache Performance"
      panels = [
        {
          title = "Cache Hit Rate"
          type  = "gauge"
          query = "sum(rate(ai_cache_hits_total[5m])) / (sum(rate(ai_cache_hits_total[5m])) + sum(rate(ai_cache_misses_total[5m])))"
        },
        {
          title = "Cache Hits vs Misses"
          type  = "graph"
          query = "sum(rate(ai_cache_hits_total[5m])) by (provider, model), sum(rate(ai_cache_misses_total[5m])) by (provider, model)"
        }
      ]
    }
    model_performance = {
      title = "Model Performance"
      panels = [
        {
          title = "Success Rate by Model"
          type  = "gauge"
          query = "sum(rate(ai_requests_total{status='success'}[5m])) by (model) / sum(rate(ai_requests_total[5m])) by (model)"
        },
        {
          title = "Average Response Time"
          type  = "graph"
          query = "rate(ai_request_duration_seconds_sum[5m]) / rate(ai_request_duration_seconds_count[5m])"
        },
        {
          title = "Rate Limits Hit"
          type  = "graph"
          query = "sum(rate(ai_rate_limits_total[5m])) by (provider, model)"
        }
      ]
    }
  }
}

resource "kubernetes_config_map" "grafana_dashboards" {
  for_each = local.dashboards

  metadata {
    name      = "dashboard-${each.key}"
    namespace = "monitoring"
    labels = {
      grafana_dashboard = "true"
    }
  }

  data = {
    "${each.key}.json" = jsonencode({
      annotations = {
        list = []
      }
      editable     = true
      graphTooltip = 0
      links        = []
      panels       = [
        for i, panel in each.value.panels : {
          datasource = "Prometheus"
          fieldConfig = {
            defaults = {
              color = {
                mode = "palette-classic"
              }
              custom = {}
              mappings = []
              thresholds = {
                mode = "absolute"
                steps = [
                  {
                    color = "green"
                    value = null
                  },
                  {
                    color = "red"
                    value = 80
                  }
                ]
              }
            }
          }
          gridPos = {
            h = 8
            w = 12
            x = (i % 2) * 12
            y = floor(i / 2) * 8
          }
          id       = i
          options  = {}
          targets  = [
            {
              expr           = panel.query
              legendFormat   = "{{provider}} - {{model}}"
              refId         = "A"
            }
          ]
          title     = panel.title
          type      = panel.type
          version   = 2
        }
      ]
      refresh       = "10s"
      schemaVersion = 30
      style         = "dark"
      tags          = ["ai-service", "monitoring"]
      templating    = {
        list = []
      }
      time = {
        from = "now-6h"
        to   = "now"
      }
      timepicker = {
        refresh_intervals = [
          "5s",
          "10s",
          "30s",
          "1m",
          "5m",
          "15m",
          "30m",
          "1h",
          "2h",
          "1d"
        ]
      }
      timezone = "browser"
      title    = each.value.title
      version  = 0
    })
  }
} 