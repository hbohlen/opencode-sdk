# Change: Core Provider Management

## Why

The current web UI only supports basic provider selection. Users need the ability to add, configure, and manage multiple custom OpenAI-compatible API providers with proper validation.

## What Changes

- Add provider management UI (add/edit/remove providers)
- Implement provider configuration storage (localStorage initially)
- Add basic connection testing for providers
- Update settings panel to support multiple providers
- Maintain backward compatibility with existing single-provider setup

## Impact

- Affected specs: web-ui (provider management)
- Affected code: SettingsPanel.tsx, OpenCodeContext.tsx
- New components: ProviderManager, BasicConnectionTester
- **BREAKING**: Settings panel structure changes

## Migration Plan

1. Extend existing provider config to support multiple providers
2. Add provider management UI to settings
3. Update context to handle provider switching
4. Preserve existing single-provider behavior as default
