# Design: Core Abstractions Architecture

## Context

The current web-ui implementation tightly couples business logic with React components and browser APIs. This makes it difficult to:
- Test services independently
- Reuse logic across different UI frameworks
- Swap out underlying implementations (storage, HTTP client)

## Goals / Non-Goals

### Goals
- Create framework-agnostic core with clear interfaces
- Enable dependency injection for all services
- Support multiple storage backends
- Enable comprehensive unit testing
- Maintain backward compatibility during migration

### Non-Goals
- Create a separate npm package (keep in monorepo for now)
- Support non-TypeScript consumers
- Implement full plugin architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  (ChatInterface, SettingsPanel, ProviderModelCard)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Bindings Layer                      │
│  (useProviders, useModels, useStorage)                      │
│  ProviderContext, ModelContext, ConnectionContext            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services Layer                       │
│  ProviderService, ConnectionService, ModelDiscoveryService  │
│  (Implement interfaces, use dependency injection)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  IStorageAdapter    │  IHttpClient   │  ILogger             │
│  LocalStorage       │  FetchClient   │  ConsoleLogger       │
│  MemoryStorage      │  MockClient    │  NoopLogger          │
└─────────────────────────────────────────────────────────────┘
```

## Decisions

### Decision 1: Interface-First Design
- **What**: Define all services via TypeScript interfaces before implementation
- **Why**: Enables mocking, testing, and alternative implementations
- **Alternatives**: Class-based with abstract methods (rejected: less flexible)

### Decision 2: Factory Pattern for Service Creation
- **What**: Use factory functions to create service instances with dependencies
- **Why**: Explicit dependency injection without complex DI framework
- **Alternatives**: DI container like InversifyJS (rejected: overkill for current scope)

### Decision 3: Keep Core in Same Package
- **What**: Create `core/` directory within web-ui, not separate package
- **Why**: Simpler build, no package management overhead
- **Alternatives**: Separate npm package (deferred: complexity not justified yet)

### Decision 4: Adapter Pattern for Storage
- **What**: Use adapter pattern for storage with interface
- **Why**: Enable LocalStorage, IndexedDB, or server-side storage
- **Alternatives**: Direct localStorage usage (rejected: not testable)

## Type Hierarchy

```typescript
// Provider Types (separated concerns)

interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  customHeaders?: Record<string, string>;
  routingMethod: 'auto' | 'direct' | 'gateway';
  gatewayEndpoint?: string;
}

interface ProviderState {
  healthStatus: HealthStatus;
  lastHealthCheck?: Date;
  consecutiveFailures: number;
  isConnected: boolean;
}

interface ProviderCapabilities {
  models: ModelInfo[];
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
}

// Composite type for full provider
type Provider = ProviderConfig & ProviderState & { capabilities?: ProviderCapabilities };
```

## Service Interfaces

```typescript
// Core service interfaces

interface IProviderService {
  getProviders(): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  addProvider(config: ProviderConfig): Promise<Provider>;
  updateProvider(id: string, updates: Partial<ProviderConfig>): Promise<Provider>;
  removeProvider(id: string): Promise<void>;
  onProvidersChange(callback: (providers: Provider[]) => void): () => void;
}

interface IConnectionService {
  testConnection(provider: Provider): Promise<ConnectionResult>;
  startHealthMonitoring(providerId: string, intervalMs: number): void;
  stopHealthMonitoring(providerId: string): void;
  getHealthStatus(providerId: string): HealthStatus;
  onHealthChange(callback: (providerId: string, status: HealthStatus) => void): () => void;
}

interface IModelDiscoveryService {
  discoverModels(provider: Provider): Promise<ModelInfo[]>;
  getCachedModels(providerId: string): ModelInfo[];
  refreshModels(providerId: string): Promise<ModelInfo[]>;
  clearCache(providerId?: string): void;
}

interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

interface IHttpClient {
  request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>>;
}
```

## Directory Structure

```
web-ui/src/
├── core/                          # Framework-agnostic core
│   ├── types/                     # Pure TypeScript types
│   │   ├── provider.ts            # Provider types
│   │   ├── model.ts               # Model types
│   │   ├── connection.ts          # Connection types
│   │   └── index.ts               # Re-exports
│   ├── interfaces/                # Service interfaces
│   │   ├── IProviderService.ts
│   │   ├── IConnectionService.ts
│   │   ├── IModelDiscoveryService.ts
│   │   ├── IStorageAdapter.ts
│   │   ├── IHttpClient.ts
│   │   └── index.ts
│   ├── services/                  # Service implementations
│   │   ├── ProviderService.ts
│   │   ├── ConnectionService.ts
│   │   ├── ModelDiscoveryService.ts
│   │   └── index.ts
│   ├── adapters/                  # Infrastructure adapters
│   │   ├── storage/
│   │   │   ├── LocalStorageAdapter.ts
│   │   │   └── MemoryStorageAdapter.ts
│   │   └── http/
│   │       ├── FetchHttpClient.ts
│   │       └── MockHttpClient.ts
│   ├── factories/                 # Service factories
│   │   └── createServices.ts
│   └── index.ts                   # Main exports
├── react/                         # React-specific bindings
│   ├── hooks/                     # Custom hooks
│   │   ├── useProviders.ts
│   │   ├── useModels.ts
│   │   └── useConnection.ts
│   ├── contexts/                  # React contexts
│   │   ├── ProviderContext.tsx
│   │   ├── ModelContext.tsx
│   │   └── ServiceContext.tsx
│   └── index.ts
├── components/                    # React components (existing)
├── services/                      # Legacy services (to be migrated)
├── types/                         # Legacy types (to be migrated)
└── lib/                           # Legacy lib (to be migrated)
```

## Migration Strategy

1. **Create new structure alongside existing**
   - Add core/ and react/ directories
   - Don't modify existing code initially

2. **Implement interfaces and adapters**
   - Create all interfaces
   - Implement adapters

3. **Create new service implementations**
   - Implement services using interfaces
   - Use adapters for storage/HTTP

4. **Create React bindings**
   - Implement hooks and contexts
   - Use new services internally

5. **Migrate components one by one**
   - Update components to use new hooks/contexts
   - Keep old imports working during migration

6. **Remove legacy code**
   - Delete old services after all components migrated
   - Update imports throughout codebase

## Risks / Trade-offs

### Risk: Migration Complexity
- **Mitigation**: Gradual migration, keep both systems working

### Risk: Over-abstraction
- **Mitigation**: Only abstract where there's clear benefit

### Trade-off: More Files vs Better Organization
- **Accept**: More files, but clearer responsibility

### Trade-off: Abstraction Overhead
- **Accept**: Minimal runtime overhead for significant testing benefits

## Open Questions

1. Should we use a DI container or keep manual injection?
   - **Current answer**: Manual injection for simplicity

2. Should encryption be part of storage adapter or separate?
   - **TODO**: Need to decide before implementation

3. How to handle service lifecycle (initialization, cleanup)?
   - **TODO**: Define lifecycle hooks in interfaces
