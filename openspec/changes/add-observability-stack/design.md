# Design: Observability Stack Integration

## Architecture Overview

The observability stack provides comprehensive monitoring, logging, and LLM analytics. The design supports both self-hosted and managed options.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Podman Pod: opencode-pod                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          Application Layer                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │  web-ui     │  │opencode-api │  │  FalkorDB   │  │   Valkey    │    │ │
│  │  │             │  │             │  │             │  │             │    │ │
│  │  │  Metrics    │  │  Metrics    │  │  Metrics    │  │  Metrics    │    │ │
│  │  │  Logs       │  │  Logs       │  │  Logs       │  │  Stats      │    │ │
│  │  │  Traces     │  │  Traces     │  │             │  │             │    │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │ │
│  └─────────┼────────────────┼────────────────┼────────────────┼───────────┘ │
│            │                │                │                │             │
│            ▼                ▼                ▼                ▼             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       Observability Layer                               │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Prometheus  │  │   Grafana   │  │    Loki     │  │  Promtail   │   │ │
│  │  │             │  │             │  │             │  │             │   │ │
│  │  │ :9090       │  │ :3001       │  │ :3100       │  │ (sidecar)   │   │ │
│  │  │ Metrics     │  │ Dashboards  │  │ Logs        │  │ Log Ship    │   │ │
│  │  │ Alerts      │  │ Explore     │  │ Query       │  │             │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │         ┌─────────────────────────────────────────────────────┐        │ │
│  │         │            OR: Datadog Agent                         │        │ │
│  │         │            (Unified metrics, logs, APM)              │        │ │
│  │         └─────────────────────────────────────────────────────┘        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LLM Analytics Layer                                 │
│                                                                              │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │         Langfuse                 │  │         Langsmith               │  │
│  │    (Self-hosted or Cloud)        │  │         (Cloud)                 │  │
│  │                                  │  │                                 │  │
│  │  - Prompt tracing               │  │  - Run tracing                  │  │
│  │  - Token usage                  │  │  - Evaluation                   │  │
│  │  - Cost tracking                │  │  - Dataset management           │  │
│  │  - Prompt versioning            │  │  - Prompt playground            │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Self-Hosted Stack Configuration

### 1. Prometheus Container

```yaml
# prometheus.yaml
prometheus:
  image: prom/prometheus:v2.48.0
  container_name: opencode-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
    - ./config/alerts.yml:/etc/prometheus/alerts.yml
    - prometheus-data:/prometheus
  command:
    - "--config.file=/etc/prometheus/prometheus.yml"
    - "--storage.tsdb.path=/prometheus"
    - "--web.enable-lifecycle"
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:9090/-/healthy"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Prometheus Configuration

```yaml
# config/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - /etc/prometheus/alerts.yml

scrape_configs:
  - job_name: "opencode-api"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: /metrics

  - job_name: "valkey"
    static_configs:
      - targets: ["localhost:6380"]

  - job_name: "falkordb"
    static_configs:
      - targets: ["localhost:6379"]

  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

### 2. Grafana Container

```yaml
# grafana.yaml
grafana:
  image: grafana/grafana:10.2.0
  container_name: opencode-grafana
  ports:
    - "3001:3000"
  volumes:
    - grafana-data:/var/lib/grafana
    - ./config/grafana/provisioning:/etc/grafana/provisioning
    - ./config/grafana/dashboards:/var/lib/grafana/dashboards
  environment:
    - GF_SECURITY_ADMIN_USER=admin
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    - GF_USERS_ALLOW_SIGN_UP=false
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 3. Loki Container

```yaml
# loki.yaml
loki:
  image: grafana/loki:2.9.0
  container_name: opencode-loki
  ports:
    - "3100:3100"
  volumes:
    - ./config/loki.yml:/etc/loki/loki.yml
    - loki-data:/loki
  command: -config.file=/etc/loki/loki.yml
  healthcheck:
    test: ["CMD-SHELL", "wget -q --spider http://localhost:3100/ready || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Datadog Alternative Configuration

```yaml
# datadog.yaml
datadog-agent:
  image: gcr.io/datadoghq/agent:7.49.0
  container_name: opencode-datadog
  environment:
    - DD_API_KEY=${DD_API_KEY}
    - DD_SITE=datadoghq.com
    - DD_APM_ENABLED=true
    - DD_LOGS_ENABLED=true
    - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
    - DD_CONTAINER_EXCLUDE="name:datadog-agent"
    - DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /proc/:/host/proc/:ro
    - /sys/fs/cgroup:/host/sys/fs/cgroup:ro
  ports:
    - "8126:8126" # APM
    - "8125:8125/udp" # DogStatsD
```

## Application Instrumentation

### Metrics Service

```typescript
// src/services/MetricsService.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";

export class MetricsService {
  private registry: Registry;

  // Request metrics
  public httpRequestsTotal: Counter;
  public httpRequestDuration: Histogram;
  public activeConnections: Gauge;

  // LLM metrics
  public llmRequestsTotal: Counter;
  public llmTokensUsed: Counter;
  public llmRequestDuration: Histogram;
  public llmCost: Counter;

  // Cache metrics
  public cacheHitsTotal: Counter;
  public cacheMissesTotal: Counter;
  public cacheSize: Gauge;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.httpRequestsTotal = new Counter({
      name: "opencode_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "path", "status"],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: "opencode_http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "path"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.llmRequestsTotal = new Counter({
      name: "opencode_llm_requests_total",
      help: "Total number of LLM API requests",
      labelNames: ["provider", "model", "status"],
      registers: [this.registry],
    });

    this.llmTokensUsed = new Counter({
      name: "opencode_llm_tokens_total",
      help: "Total tokens used in LLM requests",
      labelNames: ["provider", "model", "type"],
      registers: [this.registry],
    });

    this.llmRequestDuration = new Histogram({
      name: "opencode_llm_request_duration_seconds",
      help: "LLM request duration in seconds",
      labelNames: ["provider", "model"],
      buckets: [0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.registry],
    });

    this.llmCost = new Counter({
      name: "opencode_llm_cost_dollars",
      help: "Total cost of LLM requests in dollars",
      labelNames: ["provider", "model"],
      registers: [this.registry],
    });

    this.cacheHitsTotal = new Counter({
      name: "opencode_cache_hits_total",
      help: "Total cache hits",
      labelNames: ["cache_type"],
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: "opencode_cache_misses_total",
      help: "Total cache misses",
      labelNames: ["cache_type"],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
```

### Logger Service

```typescript
// src/services/LoggerService.ts
import winston from "winston";
import { v4 as uuidv4 } from "uuid";

interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export class LoggerService {
  private logger: winston.Logger;

  constructor(serviceName: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: serviceName },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  // Redact sensitive data
  private redact(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ["password", "apiKey", "token", "secret", "authorization"];
    const redacted = { ...obj };

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        redacted[key] = "[REDACTED]";
      }
    }

    return redacted;
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.redact(context || {}));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, {
      ...this.redact(context || {}),
      error: error?.message,
      stack: error?.stack,
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.redact(context || {}));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.redact(context || {}));
  }

  // Create child logger with correlation ID
  child(correlationId?: string): LoggerService {
    const childLogger = new LoggerService(this.logger.defaultMeta?.service || "unknown");
    childLogger.setCorrelationId(correlationId || uuidv4());
    return childLogger;
  }

  private setCorrelationId(id: string): void {
    this.logger.defaultMeta = { ...this.logger.defaultMeta, correlationId: id };
  }
}
```

## LLM Analytics - Langfuse Integration

```typescript
// src/services/LangfuseService.ts
import { Langfuse } from "langfuse";

interface LLMCallParams {
  model: string;
  provider: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  cost?: number;
}

export class LangfuseService {
  private client: Langfuse;

  constructor() {
    this.client = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_HOST || "https://cloud.langfuse.com",
    });
  }

  async traceGeneration(params: LLMCallParams, metadata?: Record<string, unknown>): Promise<string> {
    const trace = this.client.trace({
      name: `${params.provider}/${params.model}`,
      metadata,
    });

    trace.generation({
      name: "llm-call",
      model: params.model,
      input: params.prompt,
      output: params.response,
      usage: {
        promptTokens: params.inputTokens,
        completionTokens: params.outputTokens,
      },
      metadata: {
        provider: params.provider,
        durationMs: params.durationMs,
        cost: params.cost,
      },
    });

    await this.client.flushAsync();
    return trace.id;
  }

  async scoreGeneration(traceId: string, score: number, comment?: string): Promise<void> {
    this.client.score({
      traceId,
      name: "user-feedback",
      value: score,
      comment,
    });

    await this.client.flushAsync();
  }

  async shutdown(): Promise<void> {
    await this.client.shutdownAsync();
  }
}
```

## LLM Analytics - Langsmith Integration

```typescript
// src/services/LangsmithService.ts
import { Client } from "langsmith";
import { RunTree } from "langsmith/run_trees";

interface LLMCallParams {
  model: string;
  provider: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export class LangsmithService {
  private client: Client;

  constructor() {
    this.client = new Client({
      apiKey: process.env.LANGCHAIN_API_KEY,
      apiUrl: process.env.LANGCHAIN_ENDPOINT,
    });
  }

  async traceRun(params: LLMCallParams, metadata?: Record<string, unknown>): Promise<string> {
    const runTree = new RunTree({
      name: `${params.provider}/${params.model}`,
      run_type: "llm",
      inputs: { prompt: params.prompt },
      client: this.client,
    });

    await runTree.postRun();

    runTree.end({
      outputs: { response: params.response },
      extra: {
        tokens: {
          prompt: params.inputTokens,
          completion: params.outputTokens,
        },
        duration_ms: params.durationMs,
        ...metadata,
      },
    });

    await runTree.patchRun();
    return runTree.id;
  }

  async addFeedback(runId: string, score: number, comment?: string): Promise<void> {
    await this.client.createFeedback(runId, "user-feedback", {
      score,
      comment,
    });
  }
}
```

## Alert Rules

```yaml
# config/alerts.yml
groups:
  - name: opencode-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(opencode_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} errors/sec"

      - alert: HighLLMLatency
        expr: histogram_quantile(0.95, rate(opencode_llm_request_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High LLM latency detected
          description: "P95 latency is {{ $value }} seconds"

      - alert: LLMCostSpike
        expr: increase(opencode_llm_cost_dollars[1h]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: LLM cost spike detected
          description: "Hourly cost increased by ${{ $value }}"

      - alert: CacheLowHitRate
        expr: rate(opencode_cache_hits_total[5m]) / clamp_min(rate(opencode_cache_hits_total[5m]) + rate(opencode_cache_misses_total[5m]), 1) < 0.5
        for: 10m
        labels:
          severity: info
        annotations:
          summary: Low cache hit rate
          description: "Cache hit rate is {{ $value }}%"
```

## Environment Configuration

```bash
# .env additions for Observability

# Prometheus
PROMETHEUS_RETENTION_TIME=15d

# Grafana
GRAFANA_ADMIN_PASSWORD=your-secure-password
GF_SERVER_ROOT_URL=http://localhost:3001

# Loki
LOKI_RETENTION_PERIOD=168h

# Datadog (alternative)
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.com

# Langfuse
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com

# Langsmith (alternative)
LANGCHAIN_API_KEY=your-langchain-api-key
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_TRACING_V2=true

# Logging
LOG_LEVEL=info
```

## Security Considerations

### Access Control

- Grafana requires authentication
- Prometheus UI optionally password-protected
- Datadog uses API key authentication
- Langfuse/Langsmith use API key authentication

### Data Privacy

- Sensitive data redacted from logs
- Prompt content can be anonymized before analytics
- Retention policies limit data exposure

### Network Security

- Observability UIs on separate ports
- Internal-only access by default
- TLS for production deployments

## Performance Considerations

### Resource Usage

- Prometheus: ~256MB RAM minimum
- Grafana: ~128MB RAM minimum
- Loki: ~256MB RAM minimum
- Total: ~1GB RAM for full self-hosted stack

### Sampling

- High-volume traces can be sampled
- Metrics aggregation reduces storage
- Log level filtering reduces volume

### Retention

- Configure appropriate retention periods
- Archive old data if needed
- Use downsampling for long-term storage
