variable "grafana_admin_password" {
  description = "Admin password for Grafana"
  type        = string
  sensitive   = true
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerting"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "retention_days" {
  description = "Number of days to retain metrics data"
  type        = number
  default     = 15
}

variable "storage_size" {
  description = "Size of persistent storage for Prometheus"
  type        = string
  default     = "50Gi"
}

variable "alert_configs" {
  description = "Alert configuration for different metrics"
  type = map(object({
    threshold      = number
    operator       = string
    duration      = string
    severity      = string
    channel       = string
  }))
  default = {
    high_error_rate = {
      threshold = 0.05
      operator  = ">"
      duration  = "5m"
      severity  = "critical"
      channel   = "#alerts-critical"
    }
    high_latency = {
      threshold = 1000
      operator  = ">"
      duration  = "5m"
      severity  = "warning"
      channel   = "#alerts-warning"
    }
    low_cache_hit_rate = {
      threshold = 0.3
      operator  = "<"
      duration  = "15m"
      severity  = "warning"
      channel   = "#alerts-warning"
    }
  }
} 