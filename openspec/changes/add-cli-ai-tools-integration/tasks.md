# Tasks: Add CLI AI Tools Integration

## Phase 1: CLI Provider Framework

### 1.1 Core Architecture

- [x] 1.1.1 Create `ICLIProvider` interface for CLI-based providers
- [x] 1.1.2 Implement CLI subprocess manager with timeout handling
- [x] 1.1.3 Create output parser for CLI responses (stdout/stderr)
- [x] 1.1.4 Add health check for CLI tool availability
- [x] 1.1.5 Implement streaming output handling for CLI tools

### 1.2 Provider Configuration

- [x] 1.2.1 Add `cli` provider type to provider types
- [x] 1.2.2 Create CLI provider configuration schema
- [x] 1.2.3 Add CLI path resolution and validation
- [x] 1.2.4 Implement OAuth status checking for CLI tools
- [x] 1.2.5 Add CLI version detection and compatibility checking

### 1.3 Request/Response Translation

- [x] 1.3.1 Create translator from OpenAI format to CLI arguments
- [x] 1.3.2 Create parser for CLI output to OpenAI format
- [x] 1.3.3 Handle streaming responses from CLI tools
- [x] 1.3.4 Implement error translation for CLI failures

## Phase 2: Claude Code Integration

### 2.1 Claude CLI Provider

- [x] 2.1.1 Research Claude Code CLI interface and arguments
- [x] 2.1.2 Implement `ClaudeCodeProvider` class
- [x] 2.1.3 Handle Claude's OAuth flow detection
- [x] 2.1.4 Map Claude CLI output to standard format
- [x] 2.1.5 Add model selection support (if multiple models available)

### 2.2 Testing

- [x] 2.2.1 Create mock for Claude CLI responses
- [x] 2.2.2 Test successful completion flow
- [x] 2.2.3 Test streaming response handling
- [x] 2.2.4 Test error scenarios (not installed, not authenticated)

## Phase 3: Additional CLI Providers

### 3.1 Codex CLI Integration

- [ ] 3.1.1 Research Codex CLI interface
- [ ] 3.1.2 Implement `CodexCLIProvider` class
- [ ] 3.1.3 Handle OpenAI OAuth/API key detection
- [ ] 3.1.4 Add Codex-specific features support

### 3.2 Gemini CLI Integration

- [ ] 3.2.1 Research Gemini CLI interface
- [ ] 3.2.2 Implement `GeminiCLIProvider` class
- [ ] 3.2.3 Handle Google OAuth detection
- [ ] 3.2.4 Map Gemini responses to standard format

### 3.3 Qwen CLI Integration

- [ ] 3.3.1 Research Qwen CLI interface
- [ ] 3.3.2 Implement `QwenCLIProvider` class
- [ ] 3.3.3 Handle Alibaba authentication
- [ ] 3.3.4 Map Qwen responses to standard format

## Phase 4: CLIProxyAPI Investigation

### 4.1 SDK Evaluation

- [ ] 4.1.1 Research CLIProxyAPI SDK capabilities
- [ ] 4.1.2 Evaluate if SDK provides unified CLI access
- [ ] 4.1.3 Document SDK integration approach (if suitable)
- [ ] 4.1.4 Create proof-of-concept integration

### 4.2 Custom Implementation (if SDK not suitable)

- [ ] 4.2.1 Design custom CLI proxy layer
- [ ] 4.2.2 Implement OpenAI-compatible endpoint for CLI tools
- [ ] 4.2.3 Add routing logic for CLI vs API providers
- [ ] 4.2.4 Handle mixed streaming (some CLI, some API)

## Phase 5: Web-UI Integration

### 5.1 Provider Management Updates

- [ ] 5.1.1 Add CLI provider type to provider form
- [ ] 5.1.2 Show CLI tool availability status
- [ ] 5.1.3 Display OAuth authentication status
- [ ] 5.1.4 Add setup instructions for CLI tools

### 5.2 Model Selection

- [ ] 5.2.1 Query available models from CLI tools
- [ ] 5.2.2 Add model selector for CLI providers
- [ ] 5.2.3 Show model capabilities (context length, features)

### 5.3 Chat Interface

- [ ] 5.3.1 Handle CLI provider selection in chat
- [ ] 5.3.2 Show CLI-specific loading indicators
- [ ] 5.3.3 Display CLI-specific error messages

## Phase 6: Documentation

### 6.1 User Documentation

- [ ] 6.1.1 Document CLI tool installation for each provider
- [ ] 6.1.2 Create OAuth authentication guide
- [ ] 6.1.3 Add troubleshooting for common CLI issues
- [ ] 6.1.4 Document PATH configuration requirements

### 6.2 Developer Documentation

- [ ] 6.2.1 Document CLI provider interface
- [ ] 6.2.2 Create guide for adding new CLI providers
- [ ] 6.2.3 Document testing patterns for CLI providers

## Validation

- [ ] At least one CLI provider (Claude Code) works end-to-end
- [ ] OAuth status is correctly detected
- [ ] Streaming works for CLI providers
- [ ] Error messages are helpful for setup issues
- [ ] Web-UI correctly shows CLI provider options

## Dependencies

- Phase 1 must complete before Phases 2-3
- Phase 4 can run in parallel with Phase 2
- Phase 5 depends on at least one provider from Phase 2-3
- Phase 6 can run throughout

## Open Questions

1. Which CLI tools actually support programmatic invocation?
   - **TODO**: Research each CLI tool's interface

2. How to handle OAuth token refresh triggered by CLI?
   - **TODO**: Research OAuth flow for each tool

3. Should we use CLIProxyAPI SDK or custom implementation?
   - **TODO**: Evaluate SDK in Phase 4

4. How to handle CLI tools that require interactive input?
   - **TODO**: Research input handling patterns
