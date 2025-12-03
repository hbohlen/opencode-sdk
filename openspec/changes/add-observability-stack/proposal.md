# Change: Add Observability Stack for Logging, Metrics, and LLM Analytics

## Why

The opencode-sdk requires comprehensive observability to monitor system health, track LLM performance, debug issues, and optimize costs. A multi-layer observability stack provides:

1. **Metrics & Alerting**: Real-time system and application metrics
2. **Log Aggregation**: Centralized logging for debugging and audit trails
3. **LLM Analytics**: Token usage, latency, cost tracking for AI operations
4. **Visualization**: Dashboards for operational insights
5. **Tracing**: Request flow tracking across services

This proposal integrates multiple observability tools, allowing flexibility between self-hosted (Prometheus, Grafana, Loki) and managed (Datadog) solutions, with specialized LLM analytics from Langfuse or Langsmith.

## What Changes

### Core Observability Stack Options

#### Option A: Self-Hosted Stack (Prometheus + Grafana + Loki)

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization dashboards
- **Loki**: Log aggregation (Grafana's log solution)
- **Tempo** (optional): Distributed tracing

#### Option B: Managed Stack (Datadog)

- **Datadog Agent**: Unified metrics, logs, and traces
- **APM**: Application performance monitoring
- **Log Management**: Centralized logging
- **Dashboards**: Pre-built and custom visualizations

### LLM Analytics Options

#### Option A: Langfuse (Open Source)

- Self-hostable LLM observability
- Prompt management and versioning
- Cost tracking and token analytics
- Trace visualization for LLM chains

#### Option B: Langsmith (LangChain)

- Cloud-based LLM debugging
- Evaluation and testing framework
- Prompt playground
- Dataset management

### Metrics Collection

- Application metrics (request rate, latency, errors)
- Infrastructure metrics (CPU, memory, disk, network)
- LLM-specific metrics (tokens/sec, model latency, cache hit rate)
- Business metrics (conversations, code completions, user engagement)

### Log Aggregation

- Structured JSON logging across all services
- Log levels and filtering
- Correlation IDs for request tracing
- Sensitive data redaction

### Alerting & Notifications

- Prometheus Alertmanager or Datadog Monitors
- Slack/Discord/Email integrations
- Escalation policies
- Alert suppression and grouping

**BREAKING**: None - observability is an additive capability

## Impact

- Affected specs: infrastructure (new containers), all services (instrumentation)
- Affected code: Logging middleware, metrics endpoints, trace instrumentation
- New components: Metrics exporters, log formatters, trace integrations
- New dependencies: prom-client, winston, opentelemetry, langfuse-sdk
- Infrastructure: Additional containers for Prometheus, Grafana, Loki (self-hosted) or Datadog agent

## Prerequisites

- Podman Pod infrastructure
- For Datadog: Datadog API key and account
- For Langsmith: LangChain API key
- For self-hosted: Additional 1-2GB RAM for observability stack

## Relationship to Other Proposals

- **FalkorDB**: Metrics for graph query performance
- **Valkey**: Cache hit/miss metrics, connection pool stats
- **Zep Graphiti**: Memory operation analytics
- **LiteLLM**: Provider-level metrics and cost tracking
