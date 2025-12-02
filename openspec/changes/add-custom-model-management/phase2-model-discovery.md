# Change: Model Discovery & Selection

## Why

Once providers are configured, users need to discover available models from those providers and select them for chat sessions with proper capability information.

## What Changes

- Implement model discovery from provider `/v1/models` endpoints
- Add model capability detection (context length, streaming, vision)
- Create model selection UI with capability badges
- Add model validation and error handling
- Update chat interface to support model selection

## Impact

- Affected specs: web-ui (model selection), backend-api (discovery endpoint)
- Affected code: ChatInterface.tsx, OpenCodeContext.tsx, API client
- New components: ModelSelector, ModelDiscovery
- New API endpoint: /api/models/discover

## Dependencies

- Requires Phase 1: Core Provider Management to be completed
- Builds on provider configuration system

## Migration Plan

1. Add model discovery to provider management
2. Extend chat context to include selected model
3. Update model selection UI in chat
4. Add fallback to default models if discovery fails
