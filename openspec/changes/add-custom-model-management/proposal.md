# Change: Add Custom OpenAI-Compatible Model Management

## Why

The current web UI only supports basic provider selection but doesn't allow users to add custom OpenAI-compatible models, retrieve available models from providers, or test connections with specific models. Users need the ability to configure multiple custom providers and models with proper validation and error handling.

## What Changes

### Core Provider Management

- Add custom provider management with OpenAI-compatible API endpoints
- Implement provider configuration with base URL, API keys, and custom headers
- Support multiple authentication methods (Bearer tokens, API key headers, custom auth)
- Add provider validation and connection testing

### Model Discovery & Selection

- Implement real-time model discovery from provider `/v1/models` endpoints
- Add model capability detection (context length, streaming, vision, function calling)
- Create model selection UI with capability badges and parameter controls
- Support custom model definitions and overrides

### Advanced Configuration

- Add provider-specific parameter configuration (temperature, max_tokens, etc.)
- Implement custom headers and request middleware
- Support model-specific settings and presets
- Add environment variable configuration for server-side setup

### Security & Performance

- Implement encrypted storage for API keys and sensitive data
- Add rate limiting and request caching for model discovery
- Implement debouncing for UI interactions and API calls
- Add comprehensive input validation and error handling

### LiteLLM Gateway Integration

- **ENHANCED**: Now includes LiteLLM gateway integration for providers with connectivity issues
- Add automatic routing between direct API calls and LiteLLM gateway
- Implement Z.ai API connectivity fix through LiteLLM proxy
- Support problematic providers that fail with direct API calls
- Add connection health monitoring and automatic failover
- **DEPENDS ON**: Change proposal `add-litellm-gateway` for Z.ai connectivity resolution

### UI/UX Enhancements

- Redesign settings panel for multiple provider support
- Add provider manager with add/edit/remove operations
- Implement model selector with search and filtering
- Create detailed error displays with troubleshooting guidance

### Integration & Migration

- Update chat context to preserve conversation during model switches
- Maintain backward compatibility with existing single-provider setup
- Add data migration utilities for existing configurations
- Implement unified SDK interface for different provider types

**BREAKING**: Update settings panel structure and chat context to support multiple providers/models

## Potential Sub-Changes

This change is complex and could be split into phases:

### Phase 1: Core Provider Management

- Basic provider add/remove/edit functionality
- Simple connection testing
- Settings panel redesign for multiple providers
- Backward compatibility maintenance

### Phase 2: Model Discovery & Selection

- Model discovery from provider endpoints
- Basic model selection in chat
- Model capability display
- Error handling for discovery failures

### Phase 3: Advanced Features

- Custom headers and parameters
- Encrypted storage and security enhancements
- Performance optimizations (caching, rate limiting)
- Database integration for custom models

### Phase 4: Ecosystem Integration

- Plugin system for custom providers
- Provider health monitoring
- Bulk operations and management tools
- Advanced UI/UX refinements

## Security Considerations

- API keys must be encrypted at rest using Web Crypto API or similar
- Implement secure key validation without exposing keys in logs
- Add input sanitization for URLs and headers to prevent injection attacks
- Consider key rotation and expiration handling

## Performance Considerations

- Implement caching for model lists with configurable TTL
- Add debouncing for model discovery requests (300ms minimum)
- Use request deduplication for concurrent model fetches
- Implement progressive loading for large model lists

## UI/UX Design

- Provider manager: Tabbed interface with provider cards showing status
- Model selector: Dropdown with search, capability icons, and parameter previews
- Error handling: Contextual error messages with actionable recovery steps
- Loading states: Skeleton screens and progress indicators for async operations

## Implementation Patterns

- Unified Provider Interface: Abstract base class for all provider types
- Model Factory Pattern: Factory functions for creating provider-specific model instances
- Configuration Registry: Centralized registry for provider configurations
- Middleware System: Request/response middleware for custom headers and transformations

## Integration Points

- Chat Context: Preserve message history and context when switching models
- Settings Migration: Automatic migration from single-provider to multi-provider config
- Plugin System: Extensibility points for custom provider adapters
- Database Schema: New tables for provider configs and custom model definitions

## Impact

- Affected specs: web-ui (major enhancement), backend-api (new endpoints)
- Affected code: SettingsPanel.tsx, ChatInterface.tsx, OpenCodeContext.tsx, API client modules
- New components: ProviderManager, ModelSelector, ConnectionTester, ProviderRegistry
- New database tables: providers, custom_models, provider_configs
- New API endpoints: /api/providers, /api/models/discover, /api/models/test
