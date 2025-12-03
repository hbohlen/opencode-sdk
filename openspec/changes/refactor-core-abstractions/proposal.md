# Change: Refactor Core Abstractions for Framework Decoupling

## Why

The current web-ui implementation has several areas of tight coupling that make it difficult to:
1. Swap out UI frameworks (e.g., React to Vue, Solid, or vanilla JS)
2. Test business logic independently of React components
3. Reuse provider/model management logic in other contexts (CLI, other UIs)
4. Maintain clear separation of concerns

The codebase currently:
- Mixes business logic with React component state
- Has services that directly depend on browser APIs
- Lacks abstraction interfaces between layers
- Has types that combine multiple concerns

## What Changes

### Phase 1: Core Interfaces and Types

- **Create framework-agnostic core package** (`@opencode/core`)
  - Define abstract interfaces for all services
  - Create pure TypeScript types with no framework dependencies
  - Establish dependency injection patterns for services

- **Split EnhancedProvider type**
  - Separate provider configuration from runtime state
  - Create distinct types for:
    - ProviderConfig (static configuration)
    - ProviderState (runtime health, connection status)
    - ProviderCapabilities (features supported)

- **Create service interfaces**
  - IProviderService (manage provider lifecycle)
  - IConnectionService (test and monitor connections)
  - IModelDiscoveryService (discover and cache models)
  - IStorageService (abstract storage operations)

### Phase 2: Service Layer Refactoring

- **Implement storage abstraction**
  - Create IStorageAdapter interface
  - Implement LocalStorageAdapter, MemoryStorageAdapter
  - Enable future IndexedDB, server-side storage

- **Decouple services from browser APIs**
  - Abstract `fetch` calls behind interface
  - Enable dependency injection for testing
  - Support different HTTP clients

### Phase 3: React Bindings

- **Create React-specific bindings** (`@opencode/react`)
  - Hooks that wrap core services
  - Context providers that use DI
  - Keep React logic minimal, delegate to core

## Impact

- Affected code: All files in `web-ui/src/services/`, `web-ui/src/types/`, `web-ui/src/lib/`
- New packages: `core/` directory with framework-agnostic code
- **BREAKING**: Service interfaces will change

## Security Considerations

- Storage abstraction must handle API key encryption
- No sensitive data in type definitions that might be logged

## Performance Considerations

- Abstraction layers add minimal overhead
- Enable better tree-shaking with clear module boundaries
