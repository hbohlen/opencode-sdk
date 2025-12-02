# Design: LiteLLM Gateway Integration

## Architecture Overview

The LiteLLM gateway integration follows a layered architecture that preserves existing functionality while adding intelligent routing capabilities for providers with connectivity issues like Z.ai.

```
┌─────────────────────────────────────────────────────────────┐
│                    Web UI Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Settings    │  │ Model       │  │ Chat Interface      │  │
│  │ Panel       │  │ Discovery   │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Provider Context Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            OpenCodeContext Enhanced                   │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐ │  │
│  │  │ Provider    │ │ Model       │ │ Connection       │ │  │
│  │  │ Router      │ │ Discovery   │ │ Health Monitor   │ │  │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    API Routing Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Provider Router                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐ │  │
│  │  │ Direct API  │ │ LiteLLM     │ │ Health &         │ │  │
│  │  │ Client      │ │ Gateway     │ │ Fallback Logic   │ │  │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
    ┌───────────────────────┴───────────────────────┐
    │                                               │
┌─────────────────────────────────────┐   ┌─────────────────────────────┐
│         Direct API Providers         │   │     LiteLLM Gateway         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │  ┌─────────────────────────┐ │
│  │ OpenAI  │ │Other    │ │Custom   │ │   │  │ LiteLLM Client           │ │
│  │API      │ │APIs     │ │APIs     │ │   │  │ (with Z.ai support)      │ │
│  └─────────┘ └─────────┘ └─────────┘ │   │  └─────────────────────────┘ │
└─────────────────────────────────────┘   └─────────────────────────────┘
```

## Core Components

### 1. Provider Router

**Purpose**: Automatic routing decision between direct API calls and LiteLLM gateway

```typescript
interface ProviderRouter {
  // Determine routing method for a provider
  determineRoutingMethod(provider: Provider): Promise<RoutingMethod>;

  // Test connectivity for both methods
  testDirectConnection(provider: Provider): Promise<ConnectionResult>;
  testGatewayConnection(provider: Provider): Promise<ConnectionResult>;

  // Execute request with automatic fallback
  executeRequest(provider: Provider, request: ApiRequest): Promise<ApiResponse>;

  // Health monitoring
  monitorProviderHealth(provider: Provider): void;
}
```

### 2. Enhanced Provider Interface

**Purpose**: Extend existing provider management with routing capabilities

```typescript
interface EnhancedProvider extends Provider {
  // New routing properties
  routingMethod: "auto" | "direct" | "gateway";
  gatewayEndpoint?: string;
  routingPreferences: {
    preferDirect: boolean;
    fallbackEnabled: boolean;
    healthCheckInterval: number;
  };

  // Connection health
  healthStatus: "healthy" | "degraded" | "failing" | "unknown";
  lastHealthCheck?: Date;
  consecutiveFailures: number;
}
```

### 3. LiteLLM Gateway Client

**Purpose**: Handle all gateway-based API communication

```typescript
class LiteLLMGatewayClient {
  constructor(config: GatewayConfig);

  // Initialize LiteLLM client
  initialize(): Promise<void>;

  // Route provider request through LiteLLM
  routeRequest(provider: Provider, request: ApiRequest): Promise<ApiResponse>;

  // Provider-specific routing (e.g., Z.ai optimization)
  optimizeForProvider(provider: Provider): void;

  // Connection health and monitoring
  monitorConnection(): ConnectionHealth;
}
```

## Routing Logic

### Automatic Detection Algorithm

1. **Initial Test**: Try direct API call first (fastest path)
2. **Failure Detection**: If direct call fails, switch to gateway
3. **Learning System**: Remember successful routing method per provider
4. **Health Monitoring**: Continuously monitor provider health
5. **Automatic Failover**: Switch routing method based on health status

### Provider Classification

```typescript
enum ProviderType {
  DIRECT_API = "direct-api", // OpenAI, Anthropic, etc.
  GATEWAY_REQUIRED = "gateway-required", // Z.ai, problematic APIs
  HYBRID = "hybrid", // Works both ways, auto-detect
  LEGACY = "legacy", // Keep original behavior
}
```

## Z.ai Specific Integration

### Configuration Template

```typescript
const ZAI_PROVIDER_TEMPLATE: Partial<EnhancedProvider> = {
  name: "Z.ai Coding Plan API",
  baseUrl: "https://api.z.ai/api/coding/paas/v4",
  routingMethod: "gateway", // Force gateway routing
  gatewayEndpoint: process.env.LITELLM_ENDPOINT,
  routingPreferences: {
    preferDirect: false, // Skip direct attempts
    fallbackEnabled: true, // Enable fallback to other methods
    healthCheckInterval: 30000, // 30 second health checks
  },
};
```

### LiteLLM Configuration for Z.ai

```typescript
// LiteLLM provider configuration
const zaiLiteLLMConfig = {
  model: "zai/coding-paas-v4",
  api_base: "https://api.z.ai/api/coding/paas/v4",
  api_key: process.env.ZAI_API_KEY,
  // Custom headers for Z.ai
  extra_headers: {
    "Content-Type": "application/json",
    "User-Agent": "OpenCode-LiteLLM-Gateway/1.0",
  },
};
```

## Implementation Details

### File Structure

```
web-ui/src/
├── contexts/
│   └── OpenCodeContext.tsx          # Enhanced with routing
├── components/
│   ├── SettingsPanel.tsx            # Updated with gateway config
│   └── ProviderHealthMonitor.tsx    # New component
├── services/
│   ├── ProviderRouter.ts           # New routing service
│   ├── LiteLLMClient.ts           # New gateway client
│   └── ConnectionHealth.ts        # New health monitoring
└── types/
    └── EnhancedProvider.ts        # Extended provider types
```

### Database Schema Changes

```sql
-- Add routing columns to existing providers table
ALTER TABLE providers ADD COLUMN routing_method TEXT DEFAULT 'auto';
ALTER TABLE providers ADD COLUMN gateway_endpoint TEXT;
ALTER TABLE providers ADD COLUMN health_status TEXT DEFAULT 'unknown';
ALTER TABLE providers ADD COLUMN last_health_check TIMESTAMP;
ALTER TABLE providers ADD COLUMN consecutive_failures INTEGER DEFAULT 0;
```

## Performance Optimizations

### Connection Pooling

- Maintain persistent connections to LiteLLM gateway
- Pool provider-specific configurations
- Reuse authentication tokens where possible

### Caching Strategy

```typescript
interface CacheStrategy {
  // Cache successful routing decisions
  routingDecisions: TTL(24h);

  // Cache provider health status
  healthStatus: TTL(5m);

  // Cache model lists from providers
  modelLists: TTL(1h);
}
```

### Request Deduplication

- Detect concurrent identical requests
- Share responses across multiple UI components
- Reduce load on both direct APIs and gateway

## Error Handling & Fallback

### Multi-Level Fallback

1. **Primary**: Direct API call
2. **Secondary**: LiteLLM gateway
3. **Tertiary**: Alternative routing methods
4. **Emergency**: Cached responses or offline mode

### Error Classification

```typescript
enum ErrorType {
  // Network-level errors
  NETWORK_ERROR = "network", // CORS, DNS, timeout

  // Authentication errors
  AUTH_ERROR = "auth", // Invalid API key, expired token

  // Provider-specific errors
  PROVIDER_ERROR = "provider", // Provider service unavailable

  // Gateway errors
  GATEWAY_ERROR = "gateway", // LiteLLM gateway issues
}
```

## Security Considerations

### API Key Protection

- Never log API keys in browser console
- Encrypt sensitive provider configurations
- Use secure communication channels

### Gateway Security

- TLS/SSL for all gateway communications
- Request validation and sanitization
- Rate limiting and abuse prevention

## Migration Strategy

### Backward Compatibility

1. **Preserve Existing**: All current provider configurations remain functional
2. **Automatic Enhancement**: Existing providers get enhanced with routing capabilities
3. **Gradual Migration**: Users opt-in to new features as needed

### Migration Process

```typescript
interface MigrationPlan {
  // Phase 1: Add routing capabilities to existing providers
  enhanceExistingProviders(): Promise<void>;

  // Phase 2: Add gateway configuration
  addGatewayConfiguration(): Promise<void>;

  // Phase 3: Enable smart routing for new providers
  enableSmartRouting(): Promise<void>;

  // Phase 4: Deprecate legacy provider handling
  removeLegacyCode(): Promise<void>;
}
```

## Testing Strategy

### Unit Testing

- ProviderRouter routing logic
- LiteLLMClient API communication
- Connection health monitoring
- Error handling and fallback

### Integration Testing

- End-to-end Z.ai connectivity
- Mixed direct/gateway provider setups
- Performance testing with large model lists
- Error recovery scenarios

### User Acceptance Testing

- Seamless provider management experience
- Clear routing method indicators
- Helpful troubleshooting guidance

## Deployment Considerations

### Configuration Management

- Environment variables for LiteLLM endpoints
- Feature flags for gradual rollout
- Configuration validation and error handling

### Monitoring & Observability

- Gateway performance metrics
- Provider health dashboards
- Error rate monitoring
- User experience tracking

This design ensures that the LiteLLM gateway integration provides a robust solution for Z.ai connectivity while maintaining full compatibility with the existing custom model management system.
