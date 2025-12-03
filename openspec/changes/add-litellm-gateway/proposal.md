# Change: Add LiteLLM Gateway for Provider Connectivity

## Why

The current custom model management system successfully handles OpenAI-compatible provider configurations, but users are experiencing NetworkError when attempting to connect to Z.ai's API endpoint "https://api.z.ai/api/coding/paas/v4". This is likely due to CORS restrictions, network policies, or protocol differences when making direct API calls from the browser client.

Users need a reliable way to connect to providers that have connectivity restrictions, while maintaining the existing functionality for providers that work with direct API calls. A LiteLLM SDK gateway approach provides a unified interface that can handle various provider-specific connection requirements.

## What Changes

### Core Gateway Architecture

- Integrate LiteLLM SDK as an API gateway/proxy layer
- Maintain existing direct API calling for compatible providers
- Add fallback routing through LiteLLM gateway for problematic providers
- Implement intelligent routing based on provider connectivity test results
- Preserve all existing custom model management features

### Enhanced Provider Management

- Add provider type classification: "Direct API" vs "Gateway Required"
- Implement automatic connectivity testing with smart routing
- Support LiteLLM-compatible provider configurations
- Add gateway configuration management (LiteLLM endpoint, routing rules)
- Maintain backward compatibility with existing provider configurations

### Connection Problem Resolution

- Resolve Z.ai API connectivity issues through LiteLLM gateway
- Handle CORS restrictions by routing requests through proxy
- Support providers with non-standard authentication methods
- Add connection health monitoring and automatic failover
- Implement retry logic and error recovery mechanisms

### Gateway Configuration UI

- Add LiteLLM gateway settings in provider management
- Provide automatic Z.ai configuration templates
- Add gateway connection testing and validation
- Support custom LiteLLM endpoints and routing rules
- Display connection status and routing information

**BREAKING**: Update provider management to support gateway routing; new provider configuration options

## Potential Sub-Changes

This change can be implemented in phases:

### Phase 1: LiteLLM Integration Foundation

- Add LiteLLM SDK dependency and configuration
- Create gateway client abstraction layer
- Implement basic routing logic (direct vs gateway)
- Add Z.ai-specific configuration template
- Maintain existing provider functionality

### Phase 2: Enhanced Provider Management

- Update provider management UI for gateway support
- Add provider connectivity auto-detection
- Implement smart routing based on test results
- Add connection health monitoring
- Support multiple gateway endpoints

### Phase 3: Advanced Gateway Features

- Add custom routing rules and load balancing
- Implement connection pooling and retry logic
- Add provider-specific gateway optimizations
- Support streaming responses through gateway
- Add performance monitoring and analytics

### Phase 4: Ecosystem Integration

- Support additional problematic providers through gateway
- Add gateway plugin system for custom providers
- Implement gateway health checks and failover
- Add bulk provider migration utilities
- Create gateway configuration export/import

## Security Considerations

- Gateway endpoints must be secured with proper authentication
- API keys should never be exposed through gateway logs
- Implement rate limiting and request validation
- Add request/response encryption for sensitive data
- Support TLS/SSL for all gateway communications

## Performance Considerations

- Implement connection pooling for gateway requests
- Add caching for gateway responses where appropriate
- Use lazy loading for gateway client initialization
- Implement request deduplication for concurrent requests
- Add performance monitoring for gateway vs direct calls

## UI/UX Design

- Gateway status indicators in provider list
- Automatic routing information in provider details
- Connection test results with routing method display
- Gateway configuration section in settings
- Troubleshooting guidance for connection issues

## Implementation Patterns

- Provider Router: Automatic routing based on connectivity tests
- Gateway Client: LiteLLM SDK integration with error handling
- Health Monitor: Continuous monitoring of provider connections
- Configuration Manager: Unified config for direct and gateway providers
- Connection Tester: Enhanced testing with multiple routing options

## Integration Points

- Current Provider Management: Extend existing provider system
- Settings Panel: Add gateway configuration options
- Model Discovery: Support gateway-based model discovery
- Chat Interface: Transparent integration with gateway routing
- Local Storage: Preserve existing provider configurations

## Impact

- Affected specs: web-ui (enhanced provider management), backend-gateway (new LiteLLM integration)
- Affected code: OpenCodeContext.tsx, SettingsPanel.tsx, new gateway client modules
- New components: GatewayClient, ProviderRouter, ConnectionHealthMonitor
- New dependencies: LiteLLM SDK, gateway configuration utilities
- Enhanced features: Smart routing, connection health monitoring, Z.ai connectivity fix

## Provider Compatibility Matrix

| Provider         | Direct API | Gateway Required | Notes                      |
| ---------------- | ---------- | ---------------- | -------------------------- |
| OpenAI           | ✅         | Optional         | Direct works well          |
| Anthropic        | ✅         | Optional         | Direct works well          |
| Z.ai             | ❌         | ✅               | **Primary target for fix** |
| Custom Providers | Variable   | Optional         | Auto-detected              |
| Legacy Providers | ✅         | Backup           | Gateway as fallback        |

## Migration Strategy

1. **Preserve Existing**: All current provider configurations remain functional
2. **Smart Migration**: Automatically suggest gateway routing for failed providers
3. **Gradual Adoption**: Users can opt-in to gateway routing per provider
4. **Configuration Export**: Support exporting mixed direct/gateway configurations
5. **Rollback Safety**: Easy reversion to direct API calls if gateway issues arise

## Success Metrics

- Z.ai API connectivity success rate: 100% through gateway
- Provider configuration success rate: >95% with smart routing
- User experience: Transparent gateway integration
- Performance: Gateway overhead <100ms for routing decisions
- Compatibility: 100% backward compatibility with existing providers
