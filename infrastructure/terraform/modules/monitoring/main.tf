terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

# Prometheus Stack (kube-prometheus-stack)
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  create_namespace = true

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }

  # Enable persistent storage
  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName"
    value = "gp3"
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }

  # Configure retention
  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "15d"
  }

  # Configure Grafana datasources
  set {
    name  = "grafana.additionalDataSources[0].name"
    value = "Prometheus"
  }

  set {
    name  = "grafana.additionalDataSources[0].type"
    value = "prometheus"
  }

  set {
    name  = "grafana.additionalDataSources[0].url"
    value = "http://prometheus-operated:9090"
  }

  # Configure alerting
  set {
    name  = "alertmanager.config.global.resolve_timeout"
    value = "5m"
  }

  set {
    name  = "alertmanager.config.route.group_by[0]"
    value = "alertname"
  }

  set {
    name  = "alertmanager.config.route.group_wait"
    value = "30s"
  }

  set {
    name  = "alertmanager.config.route.group_interval"
    value = "5m"
  }

  set {
    name  = "alertmanager.config.route.repeat_interval"
    value = "12h"
  }

  # Configure default receivers
  set {
    name  = "alertmanager.config.receivers[0].name"
    value = "default-receiver"
  }

  set {
    name  = "alertmanager.config.receivers[0].slack_configs[0].api_url"
    value = var.slack_webhook_url
  }

  set {
    name  = "alertmanager.config.receivers[0].slack_configs[0].channel"
    value = "#alerts"
  }
} 