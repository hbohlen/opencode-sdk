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
- Create abstraction for CLI-based AI providers
- Implement subprocess management for CLI tools
- Handle OAuth token refresh and credential sharing

### Provider Implementations
- Claude Code integration via `claude` CLI
- Codex CLI integration
- Gemini CLI integration via `gemini` CLI
- Qwen CLI integration

### CLIProxyAPI Pattern (Optional)
- Investigate CLIProxyAPI SDK for unified CLI access
- Implement custom proxy if SDK not suitable
- Expose CLI tools as standard OpenAI-compatible endpoints

### Web-UI Updates
- Add CLI provider type to provider management
- Show OAuth status for CLI providers
- Guide users through CLI setup

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
