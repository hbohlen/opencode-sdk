# Tasks: Refactor Core Abstractions

## Phase 1: Core Interfaces and Types

### 1.1 Create Core Package Structure

- [ ] 1.1.1 Create `web-ui/src/core/` directory for framework-agnostic code
- [ ] 1.1.2 Create `web-ui/src/core/types/` for pure TypeScript types
- [ ] 1.1.3 Create `web-ui/src/core/interfaces/` for service interfaces
- [ ] 1.1.4 Create `web-ui/src/core/services/` for service implementations
- [ ] 1.1.5 Update tsconfig to support path aliases for `@core/*`

### 1.2 Split Provider Types

- [ ] 1.2.1 Create `ProviderConfig` interface (static configuration)
  - id, name, baseUrl, apiKey, customHeaders
- [ ] 1.2.2 Create `ProviderState` interface (runtime state)
  - healthStatus, lastHealthCheck, consecutiveFailures
- [ ] 1.2.3 Create `ProviderCapabilities` interface (features)
  - supportedModels, streamingSupport, functionCalling
- [ ] 1.2.4 Create `Provider` composite type combining all
- [ ] 1.2.5 Add JSDoc documentation to all types

### 1.3 Create Service Interfaces

- [ ] 1.3.1 Create `IProviderService` interface
  - addProvider, removeProvider, updateProvider, getProviders
- [ ] 1.3.2 Create `IConnectionService` interface
  - testConnection, monitorHealth, getHealthStatus
- [ ] 1.3.3 Create `IModelDiscoveryService` interface
  - discoverModels, getModelById, getCachedModels
- [ ] 1.3.4 Create `IStorageService` interface
  - get, set, remove, clear, getKeys
- [ ] 1.3.5 Create `IHttpClient` interface
  - get, post, put, delete, request

## Phase 2: Service Layer Refactoring

### 2.1 Implement Storage Abstraction

- [ ] 2.1.1 Create `IStorageAdapter` interface
- [ ] 2.1.2 Implement `LocalStorageAdapter`
- [ ] 2.1.3 Implement `MemoryStorageAdapter` (for testing)
- [ ] 2.1.4 Create `StorageService` with adapter injection
- [ ] 2.1.5 Add encryption support for sensitive data

### 2.2 Implement HTTP Client Abstraction

- [ ] 2.2.1 Create `IHttpClient` interface with request/response types
- [ ] 2.2.2 Implement `FetchHttpClient` using native fetch
- [ ] 2.2.3 Add request/response interceptors support
- [ ] 2.2.4 Add retry logic and timeout handling
- [ ] 2.2.5 Add mock HTTP client for testing

### 2.3 Refactor Existing Services

- [ ] 2.3.1 Refactor `ProviderRouter` to use interfaces
- [ ] 2.3.2 Refactor `ConnectionHealthMonitor` to use interfaces
- [ ] 2.3.3 Refactor `ModelDiscoveryService` to use interfaces
- [ ] 2.3.4 Create service factory for dependency injection
- [ ] 2.3.5 Add unit tests for refactored services

## Phase 3: React Bindings

### 3.1 Create React Hooks

- [ ] 3.1.1 Create `useProviders` hook wrapping ProviderService
- [ ] 3.1.2 Create `useModels` hook wrapping ModelDiscoveryService
- [ ] 3.1.3 Create `useConnectionHealth` hook wrapping ConnectionService
- [ ] 3.1.4 Create `useStorage` hook wrapping StorageService
- [ ] 3.1.5 Add proper TypeScript types for all hooks

### 3.2 Refactor OpenCodeContext

- [ ] 3.2.1 Split into smaller, focused contexts:
  - ProviderContext
  - ModelContext
  - ConnectionContext
  - SettingsContext
- [ ] 3.2.2 Create context providers that inject services
- [ ] 3.2.3 Update components to use new focused contexts
- [ ] 3.2.4 Add context composition utilities
- [ ] 3.2.5 Update tests for new context structure

### 3.3 Update Components

- [ ] 3.3.1 Update SettingsPanel to use new hooks
- [ ] 3.3.2 Update ProviderModelCard to use new hooks
- [ ] 3.3.3 Update ChatInterface to use new contexts
- [ ] 3.3.4 Ensure all components only use React bindings, not core services directly
- [ ] 3.3.5 Add component tests

## Validation

- [ ] All existing functionality works after refactoring
- [ ] Build completes without errors
- [ ] Lint passes
- [ ] Core services can be tested without React
- [ ] Storage adapter can be swapped at runtime

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Within each phase, tasks can be done in parallel where noted
