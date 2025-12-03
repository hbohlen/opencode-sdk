# CLI Providers Spec

## ADDED Requirements

### Requirement: CLI Provider Framework
The system SHALL support CLI-based AI providers as an alternative to API-based providers.

#### Scenario: CLI Provider Registration
Given a user configures a CLI provider (e.g., Claude Code)
When the provider is added to the system
Then the system validates CLI availability and stores the configuration

#### Scenario: CLI Availability Check
Given a CLI provider is configured
When the system checks provider health
Then it verifies the CLI tool is installed and accessible in PATH

### Requirement: Claude Code Integration
The system SHALL integrate with Claude Code CLI for OAuth-authenticated model access.

#### Scenario: Claude Code Chat
Given Claude Code is installed and authenticated
When a user sends a chat message via Claude Code provider
Then the system invokes the CLI and returns the response

#### Scenario: Claude Code Authentication Status
Given Claude Code provider is configured
When the system checks authentication
Then it correctly reports if the user is logged in via OAuth

### Requirement: Codex CLI Integration
The system SHALL integrate with OpenAI Codex CLI for code generation.

#### Scenario: Codex Chat
Given Codex CLI is installed and configured
When a user sends a code generation request
Then the system invokes Codex CLI and returns the response

### Requirement: Gemini CLI Integration
The system SHALL integrate with Google Gemini CLI for model access.

#### Scenario: Gemini Chat
Given Gemini CLI is installed and authenticated via Google OAuth
When a user sends a chat message
Then the system invokes Gemini CLI and returns the response

### Requirement: Qwen CLI Integration
The system SHALL integrate with Qwen CLI for Alibaba model access.

#### Scenario: Qwen Chat
Given Qwen CLI is installed and authenticated
When a user sends a chat message
Then the system invokes Qwen CLI and returns the response

### Requirement: Streaming Support for CLI Providers
The system SHALL support streaming responses from CLI providers.

#### Scenario: CLI Streaming
Given a CLI provider that supports streaming
When a user requests a streaming response
Then the system streams CLI stdout to the client in real-time

### Requirement: CLIProxyAPI Integration (Optional)
The system MAY integrate with CLIProxyAPI SDK for unified CLI access.

#### Scenario: Unified CLI Access
Given CLIProxyAPI SDK is configured
When a request is made to a CLI provider
Then the SDK handles CLI invocation and response parsing

### Requirement: OpenAI-Compatible Endpoint for CLI Providers
The system SHALL expose CLI providers via OpenAI-compatible API endpoints.

#### Scenario: CLI via Standard API
Given a CLI provider is configured
When an OpenAI-format chat completion request is sent
Then the system translates to CLI, executes, and returns OpenAI-format response

## MODIFIED Requirements

### Requirement: Provider Type Support
The provider system SHALL support multiple provider types including 'api' and 'cli'.

#### Scenario: Mixed Provider Types
Given both API and CLI providers are configured
When the user selects a provider
Then the system correctly routes to either HTTP or CLI execution

### Requirement: Web-UI Provider Management
The web-ui provider form SHALL support CLI provider configuration.

#### Scenario: Add CLI Provider
Given the user is adding a new provider
When they select CLI type
Then the form shows CLI-specific fields (command, path) instead of API fields (baseUrl, apiKey)

## REMOVED Requirements

None - CLI providers are additive.
