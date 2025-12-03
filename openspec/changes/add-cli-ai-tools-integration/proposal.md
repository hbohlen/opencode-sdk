# Change: Add CLI AI Tools Integration

## Why

Many powerful AI coding assistants are available as CLI tools with OAuth authentication:
- **Claude Code** - Anthropic's coding assistant CLI
- **Codex CLI** - OpenAI's code generation CLI
- **Gemini CLI** - Google's Gemini model access
- **Qwen CLI** - Alibaba's Qwen models

These tools:
- Handle OAuth flows natively
- Manage credentials securely
- Provide access to models not available via standard API
- Often have better rate limits for authenticated users

Integrating these allows users to:
- Use their existing OAuth credentials
- Access CLI-specific model features
- Avoid API key management for these providers
- Leverage CLIProxyAPI patterns for unified access

## What Changes

### CLI Provider Framework
- The system SHALL create abstraction for CLI-based AI providers
- The system SHALL implement subprocess management for CLI tools
- The system SHALL handle OAuth token refresh and credential sharing

### Provider Implementations
- The system SHALL integrate Claude Code via `claude` CLI
- The system SHALL integrate Codex CLI
- The system SHALL integrate Gemini CLI via `gemini` CLI
- The system SHALL integrate Qwen CLI

### CLIProxyAPI Pattern (Optional)
- The system SHALL investigate CLIProxyAPI SDK for unified CLI access
- The system SHALL implement custom proxy if SDK not suitable
- The system SHALL expose CLI tools as standard OpenAI-compatible endpoints

### Web-UI Updates
- The system SHALL add CLI provider type to provider management
- The system SHALL show OAuth status for CLI providers
- The system SHALL guide users through CLI setup

## Impact

- New provider type: CLI-based providers
- New dependencies: CLI tool installations (user responsibility)
- Modified: Provider types and routing
- **ENABLES**: OAuth-based model access without API keys

## Prerequisites

- Users must install CLI tools themselves
- CLI tools must be in PATH
- OAuth authentication must be completed in CLI

## Security Considerations

- CLI tools manage their own credentials
- No API keys stored by our application
- Subprocess isolation for CLI execution
- Audit logging for CLI invocations
