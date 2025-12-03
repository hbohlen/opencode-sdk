# Tasks: Add Observability Stack for Logging, Metrics, and LLM Analytics

## BLOCKERS

This proposal requires infrastructure that is not currently implemented:

1. **Backend Server Required**: Metrics collection and logging require a backend API server
2. **Container Runtime Required**: Prometheus, Grafana, and Loki require container orchestration (Podman/Docker)
3. **External Service Dependencies**: Langfuse/Langsmith require API keys and external service configuration
4. **No Current Metrics Endpoints**: Web-ui is client-only, no /metrics endpoint exists

## Prerequisites Not Met

- [ ] Backend API server implementation
- [ ] Podman/Docker container runtime
- [ ] External API keys (Langfuse, Langsmith, Datadog - depending on chosen stack)
- [ ] Additional 1-2GB RAM for observability stack (self-hosted option)

---

## 1. Core Infrastructure Setup

### 1.1 Self-Hosted Stack (Prometheus + Grafana + Loki)

- [ ] 1.1.1 Add Prometheus container to Podman Pod
  - **BLOCKER**: No Podman/Docker infrastructure exists
- [ ] 1.1.2 Configure Prometheus scrape targets
  - **BLOCKER**: No /metrics endpoint exists
- [ ] 1.1.3 Add Grafana container with persistent storage
- [ ] 1.1.4 Configure Grafana data sources (Prometheus, Loki)
- [ ] 1.1.5 Add Loki container for log aggregation
- [ ] 1.1.6 Configure Promtail for log shipping
- [ ] 1.1.7 Set up health checks for all containers

### 1.2 Managed Stack (Datadog) - Alternative

- [ ] 1.2.1 Add Datadog Agent container
  - **BLOCKER**: Requires DD_API_KEY and Datadog account
- [ ] 1.2.2 Configure DD_API_KEY and DD_SITE
- [ ] 1.2.3 Enable APM and log collection
- [ ] 1.2.4 Configure container autodiscovery
- [ ] 1.2.5 Set up Datadog integrations

## 2. Application Instrumentation

- [ ] 2.1 Add prom-client for Prometheus metrics
  - **BLOCKER**: Requires backend server
- [ ] 2.2 Create MetricsService abstraction
- [ ] 2.3 Implement request/response metrics middleware
- [ ] 2.4 Add custom business metrics
- [ ] 2.5 Create /metrics endpoint for scraping
- [ ] 2.6 Add OpenTelemetry for distributed tracing

## 3. Logging Infrastructure

- [ ] 3.1 Add winston logging library
  - **BLOCKER**: Requires backend server for structured logging
- [ ] 3.2 Create LoggerService with structured JSON output
- [ ] 3.3 Implement correlation ID middleware
- [ ] 3.4 Add log levels configuration
- [ ] 3.5 Implement sensitive data redaction
- [ ] 3.6 Configure log rotation and retention

## 4. LLM Analytics - Langfuse

- [ ] 4.1 Add langfuse npm package
  - **TODO**: Can be added when backend is implemented
- [ ] 4.2 Create LangfuseClient service
- [ ] 4.3 Implement trace creation for LLM calls
- [ ] 4.4 Add token usage tracking
- [ ] 4.5 Implement cost calculation
- [ ] 4.6 Create prompt versioning integration
- [ ] 4.7 Add generation scoring and feedback

## 5. LLM Analytics - Langsmith (Alternative)

- [ ] 5.1 Add langsmith npm package
  - **TODO**: Can be added when backend is implemented
- [ ] 5.2 Configure LANGCHAIN_API_KEY
  - **BLOCKER**: Requires Langchain API key
- [ ] 5.3 Implement trace callbacks
- [ ] 5.4 Add run tree visualization
- [ ] 5.5 Create evaluation datasets
- [ ] 5.6 Implement feedback collection

## 6. Dashboards & Visualization

- [ ] 6.1 Create Grafana dashboard for system metrics
  - **BLOCKER**: Requires Grafana infrastructure
- [ ] 6.2 Create LLM performance dashboard
- [ ] 6.3 Create cost tracking dashboard
- [ ] 6.4 Add log explorer panels
- [ ] 6.5 Create alerting dashboard
- [ ] 6.6 Export dashboards as JSON for version control

## 7. Alerting & Notifications

- [ ] 7.1 Configure Prometheus Alertmanager
- [ ] 7.2 Define alert rules for critical metrics
- [ ] 7.3 Set up notification channels (Slack, Email)
- [ ] 7.4 Create escalation policies
- [ ] 7.5 Implement alert silencing rules
- [ ] 7.6 Add runbook links to alerts

## 8. Web UI Integration

- [ ] 8.1 Add observability context to OpenCodeContext
  - **BLOCKER**: Requires backend API to proxy observability data
- [ ] 8.2 Create metrics display components
- [ ] 8.3 Add log viewer integration
- [ ] 8.4 Implement trace visualization
- [ ] 8.5 Create LLM analytics dashboard link

## 9. Testing & Validation

- [ ] 9.1 Test metrics endpoint availability
  - **BLOCKER**: No test framework configured
- [ ] 9.2 Validate log aggregation pipeline
- [ ] 9.3 Test alert triggering and notification
- [ ] 9.4 Verify LLM trace capture
- [ ] 9.5 Performance test observability overhead
- [ ] 9.6 Test dashboard queries and panels

## 10. Documentation

- [ ] 10.1 Document observability stack options
- [ ] 10.2 Create setup guides for each option
- [ ] 10.3 Write alert runbooks
- [ ] 10.4 Document custom metrics
- [ ] 10.5 Create dashboard usage guide
- [ ] 10.6 Add troubleshooting documentation

## Dependencies

- Task 1 provides infrastructure for all other tasks
- Tasks 2-3 can run in parallel after Task 1
- Tasks 4-5 are alternatives (choose one or both)
- Task 6 depends on Tasks 1-5
- Task 7 depends on Task 1
- Task 8 depends on Tasks 2-5
- Tasks 9-10 depend on all other tasks

## Next Steps to Unblock

1. **Create Backend Server**: Implement Node.js/Express backend with metrics endpoints
2. **Set Up Container Infrastructure**: Configure Podman/Docker for service deployment
3. **Choose Observability Stack**: Decide between self-hosted (Prometheus/Grafana) or managed (Datadog)
4. **Choose LLM Analytics**: Decide between Langfuse (open-source) or Langsmith (cloud)
5. **Add Test Framework**: Configure testing for observability services
