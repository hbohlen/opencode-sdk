# Implementation Tasks by Phase

## Phase 1: Core Provider Management (COMPLETED)

### 1. Backend API Integration (Phase 1) - COMPLETED

- [x] 1.1 Create OpenCode API client methods for model discovery (ModelDiscoveryService.ts)
- [x] 1.2 Implement provider configuration validation (ProviderRouter.ts, ConnectionHealthMonitor.ts)
- [x] 1.3 Add connection testing with specific models (testProviderConnection in ModelDiscoveryService.ts)

### 2. Settings Panel Enhancement - COMPLETED

- [x] 2.1 Redesign settings panel for multiple provider support (SettingsPanel.tsx)
- [x] 2.2 Add provider management (add/edit/remove) (SettingsPanel.tsx)
- [x] 2.3 Implement model discovery and selection UI (ProviderModelCard.tsx)
- [x] 2.4 Add connection testing interface (SettingsPanel.tsx)

### 3. Model Management - COMPLETED

- [x] 3.1 Create provider/model data structures (EnhancedProvider.ts, ModelInfo interface)
- [x] 3.2 Implement local storage for provider configurations (React state in OpenCodeContext)
- [x] 3.3 Add model validation and error handling (ModelDiscoveryService.ts)
- [x] 3.4 Create model selection dropdown for chat (ProviderModelCard.tsx)

## Phase 2: Model Discovery & Selection (PARTIALLY COMPLETED)

### 4. Chat Interface Updates

- [ ] 4.1 Add model selection to chat interface
  - **BLOCKER**: ChatInterface.tsx currently lacks model selector dropdown
  - **TODO**: Need to integrate model selection state with chat message handling
- [ ] 4.2 Update context to use selected model
  - **BLOCKER**: OpenCodeContext needs `selectedModel` state
- [ ] 4.3 Add model switching during conversation
  - **BLOCKER**: Need to preserve conversation context when switching
- [ ] 4.4 Display current model in chat header
  - **BLOCKER**: UI design decision needed

### 5. Error Handling & UX - PARTIALLY COMPLETED

- [x] 5.1 Implement detailed error messages for connection failures
- [x] 5.2 Add loading states for model discovery (ProviderModelCard.tsx)
- [ ] 5.3 Create user-friendly error recovery flows
  - **BLOCKER**: Need to design recovery UI patterns
- [x] 5.4 Add validation for API endpoints and keys

## Phase 3: Advanced Configuration

### 7. Security & Performance (Phase 3)

- [ ] 7.1 Implement encrypted storage for API keys
  - **BLOCKER**: Requires Web Crypto API implementation decision
  - **FIX**: Currently storing API keys in plain text in React state
  - **TODO**: Implement encryption at rest using Web Crypto API
- [ ] 7.2 Add caching for model discovery
  - **TODO**: Implement TTL-based cache for discovered models
- [ ] 7.3 Implement rate limiting and debouncing
  - **TODO**: Add debouncing for model discovery requests
- [ ] 7.4 Add database integration for custom models
  - **BLOCKER**: Requires backend database (not currently implemented)
  - **TODO**: Consider localStorage/IndexedDB for client-side persistence

### 8. Advanced Features (Phase 3)

- [x] 8.1 Add custom headers and parameters (SettingsPanel.tsx supports customHeaders)
- [ ] 8.2 Support environment variable configuration
  - **BLOCKER**: Requires backend server to handle env vars securely
- [ ] 8.3 Implement provider-specific settings
  - **TODO**: Add model-specific parameter overrides (temperature, max_tokens, etc.)
- [ ] 8.4 Add bulk operations for management
  - **TODO**: Import/export provider configurations

## Phase 4: Testing & Polish

### 6. Testing & Validation (Phase 4)

- [ ] 6.1 Test with various OpenAI-compatible providers
  - **BLOCKER**: No automated test infrastructure exists in web-ui
  - **TODO**: Add Jest/Vitest test configuration
- [ ] 6.2 Validate error handling scenarios
- [ ] 6.3 Test model discovery and selection
- [ ] 6.4 Verify connection testing functionality
- [ ] 6.5 Test security features and encryption
- [ ] 6.6 Performance testing for caching and rate limiting

## Summary

### Completed
- Core provider management UI and services
- Provider routing (direct/gateway)
- Model discovery via OpenAI-compatible API
- Health monitoring

### Remaining Work (with Blockers)
1. **Chat Interface Integration**: Need model selector in chat, preserve context on switch
2. **API Key Encryption**: Security concern - keys stored in plain text
3. **Testing Infrastructure**: No test framework configured
4. **Backend Integration**: For env vars, persistent storage, and database models

### Open Questions (from design.md)
- Should we implement model capability detection (context length, streaming support)?
  - **Answer**: Partially implemented in ModelDiscoveryService.extractCapabilities()
- How to handle providers with different authentication methods?
  - **Answer**: Custom headers supported, but more auth patterns may be needed
- Should we add provider-specific configuration options?
  - **TODO**: Not yet implemented
- How to implement secure API key storage and encryption?
  - **BLOCKER**: Needs architecture decision
