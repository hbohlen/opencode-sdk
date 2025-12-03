# Design: CLI AI Tools Integration

## Context

Modern AI coding assistants provide CLI tools that handle OAuth authentication and credential management natively. Integrating these tools allows access to models that may not be available via standard API, while leveraging the CLI's built-in credential management.

## Goals / Non-Goals

### Goals
- Integrate CLI-based AI tools (Claude Code, Codex, Gemini, Qwen)
- Support OAuth-authenticated models via CLI
- Provide unified interface for CLI and API providers
- Handle streaming responses from CLI tools
- Detect and report CLI tool/auth status

### Non-Goals
- Manage CLI tool installation (user responsibility)
- Handle OAuth flows (CLI tools handle this)
- Support all CLI tool features (focus on chat/completion)
- Replace API-based providers (CLI is additional option)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Server (Node.js)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Provider Router                        │ │
│  │                                                         │ │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │ │
│  │  │   API Providers │    │     CLI Providers       │   │ │
│  │  │                 │    │                         │   │ │
│  │  │  - OpenAI       │    │  - Claude Code          │   │ │
│  │  │  - Anthropic    │    │  - Codex CLI            │   │ │
│  │  │  - Z.ai         │    │  - Gemini CLI           │   │ │
│  │  │                 │    │  - Qwen CLI             │   │ │
│  │  └────────┬────────┘    └───────────┬─────────────┘   │ │
│  │           │                         │                  │ │
│  │           ▼                         ▼                  │ │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │ │
│  │  │   HTTP Client   │    │   CLI Subprocess Mgr    │   │ │
│  │  │   (fetch/axios) │    │   (child_process)       │   │ │
│  │  └─────────────────┘    └─────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  claude     │    │  gemini     │    │  codex      │
    │  (CLI)      │    │  (CLI)      │    │  (CLI)      │
    │             │    │             │    │             │
    │  OAuth      │    │  OAuth      │    │  API Key    │
    │  Managed    │    │  Managed    │    │  or OAuth   │
    └─────────────┘    └─────────────┘    └─────────────┘
```

## CLI Provider Interface

```typescript
interface ICLIProvider {
  // Provider identification
  readonly id: string;
  readonly name: string;
  readonly cliCommand: string;  // e.g., 'claude', 'gemini'
  
  // Check if CLI tool is available
  isAvailable(): Promise<boolean>;
  
  // Check authentication status
  isAuthenticated(): Promise<boolean>;
  
  // Get available models
  getModels(): Promise<CLIModel[]>;
  
  // Execute chat completion
  chat(request: ChatRequest): Promise<ChatResponse>;
  
  // Execute streaming chat
  streamChat(request: ChatRequest): AsyncGenerator<ChatChunk>;
}

interface CLIModel {
  id: string;
  name: string;
  contextLength?: number;
  capabilities: string[];
}

interface ChatRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}
```

## CLI Subprocess Manager

```typescript
import { spawn, ChildProcess } from 'child_process';

interface CLIExecuteOptions {
  command: string;
  args: string[];
  input?: string;
  timeout?: number;
  env?: Record<string, string>;
}

class CLISubprocessManager {
  private defaultTimeout = 120000; // 2 minutes

  async execute(options: CLIExecuteOptions): Promise<CLIResult> {
    return new Promise((resolve, reject) => {
      const { command, args, input, timeout, env } = options;
      
      const proc = spawn(command, args, {
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      let stdout = '';
      let stderr = '';
      
      // Set timeout
      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error(`CLI command timed out after ${timeout || this.defaultTimeout}ms`));
      }, timeout || this.defaultTimeout);
      
      proc.stdout.on('data', (data) => { stdout += data; });
      proc.stderr.on('data', (data) => { stderr += data; });
      
      if (input) {
        proc.stdin.write(input);
        proc.stdin.end();
      }
      
      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve({ code, stdout, stderr });
      });
      
      proc.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async *stream(options: CLIExecuteOptions): AsyncGenerator<string> {
    const { command, args, input, env } = options;
    
    const proc = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    if (input) {
      proc.stdin.write(input);
      proc.stdin.end();
    }
    
    for await (const chunk of proc.stdout) {
      yield chunk.toString();
    }
  }
}
```

## Claude Code Provider Example

```typescript
class ClaudeCodeProvider implements ICLIProvider {
  readonly id = 'claude-code';
  readonly name = 'Claude Code';
  readonly cliCommand = 'claude';
  
  private subprocess = new CLISubprocessManager();

  async isAvailable(): Promise<boolean> {
    try {
      await this.subprocess.execute({
        command: 'which',
        args: ['claude'],
      });
      return true;
    } catch {
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const result = await this.subprocess.execute({
        command: 'claude',
        args: ['auth', 'status'],
      });
      return result.stdout.includes('authenticated');
    } catch {
      return false;
    }
  }

  async getModels(): Promise<CLIModel[]> {
    // Claude Code may have fixed model selection
    return [
      {
        id: 'claude-code-default',
        name: 'Claude Code',
        capabilities: ['chat', 'code', 'analysis'],
      },
    ];
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const prompt = this.formatPrompt(request.messages);
    
    const result = await this.subprocess.execute({
      command: 'claude',
      args: ['chat', '--format', 'json'],
      input: prompt,
    });
    
    return this.parseResponse(result.stdout);
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<ChatChunk> {
    const prompt = this.formatPrompt(request.messages);
    
    for await (const chunk of this.subprocess.stream({
      command: 'claude',
      args: ['chat', '--stream'],
      input: prompt,
    })) {
      yield this.parseChunk(chunk);
    }
  }

  private formatPrompt(messages: Message[]): string {
    // Convert messages to Claude CLI input format
    return messages.map(m => 
      `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`
    ).join('\n\n');
  }

  private parseResponse(output: string): ChatResponse {
    // Parse Claude CLI JSON output
    try {
      return JSON.parse(output);
    } catch {
      return {
        content: output,
        model: 'claude-code',
        usage: { prompt_tokens: 0, completion_tokens: 0 },
      };
    }
  }
}
```

## CLIProxyAPI Integration Pattern

If CLIProxyAPI SDK is available:

```typescript
import { CLIProxyAPI } from 'cli-proxy-api'; // hypothetical SDK

class CLIProxyProvider implements ICLIProvider {
  private client: CLIProxyAPI;

  constructor() {
    this.client = new CLIProxyAPI({
      // SDK configuration
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Use SDK's unified interface
    return this.client.chat({
      provider: this.id,
      ...request,
    });
  }
}
```

If custom implementation needed:

```typescript
class CustomCLIProxy {
  private providers: Map<string, ICLIProvider>;

  constructor() {
    this.providers = new Map([
      ['claude-code', new ClaudeCodeProvider()],
      ['gemini-cli', new GeminiCLIProvider()],
      ['codex-cli', new CodexCLIProvider()],
      ['qwen-cli', new QwenCLIProvider()],
    ]);
  }

  // Expose as OpenAI-compatible endpoint
  async chat(request: OpenAIRequest): Promise<OpenAIResponse> {
    const providerId = this.extractProviderId(request.model);
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Unknown CLI provider: ${providerId}`);
    }
    
    const response = await provider.chat(this.toProviderRequest(request));
    return this.toOpenAIResponse(response);
  }
}
```

## Provider Configuration

```typescript
interface CLIProviderConfig {
  id: string;
  type: 'cli';
  name: string;
  cliCommand: string;
  // No API key needed - CLI manages auth
  enabled: boolean;
  // Optional: custom CLI path
  cliPath?: string;
  // Optional: environment overrides
  env?: Record<string, string>;
}

// Example configurations
const cliProviders: CLIProviderConfig[] = [
  {
    id: 'claude-code',
    type: 'cli',
    name: 'Claude Code',
    cliCommand: 'claude',
    enabled: true,
  },
  {
    id: 'gemini-cli',
    type: 'cli',
    name: 'Gemini CLI',
    cliCommand: 'gemini',
    enabled: true,
  },
];
```

## Web-UI Provider Type

```typescript
// Updated EnhancedProvider type
interface EnhancedProvider {
  id: string;
  name: string;
  type: 'api' | 'cli';  // NEW: provider type
  
  // For API providers
  baseUrl?: string;
  apiKeyRef?: string;  // 1Password reference
  
  // For CLI providers
  cliCommand?: string;
  cliPath?: string;
  
  // Common
  routingMethod: 'auto' | 'direct' | 'gateway';
  healthStatus: 'healthy' | 'degraded' | 'failing' | 'unknown';
  isAuthenticated?: boolean;  // NEW: for CLI providers
}
```

## Error Handling

```typescript
class CLIError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly exitCode: number | null,
    public readonly stderr: string,
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

class CLINotInstalledError extends CLIError {
  constructor(provider: string, command: string) {
    super(
      `CLI tool '${command}' is not installed. Please install it to use ${provider}.`,
      provider,
      null,
      '',
    );
    this.name = 'CLINotInstalledError';
  }
}

class CLINotAuthenticatedError extends CLIError {
  constructor(provider: string) {
    super(
      `${provider} is not authenticated. Please run the CLI login command.`,
      provider,
      null,
      '',
    );
    this.name = 'CLINotAuthenticatedError';
  }
}
```

## Security Considerations

### Subprocess Isolation
- Run CLI commands with minimal environment
- Don't expose internal env vars to CLI
- Sanitize input before passing to CLI

### Credential Security
- CLI tools manage their own credentials
- Don't attempt to read CLI credential files
- Trust CLI's OAuth token management

### Command Injection Prevention
```typescript
// BAD: Never interpolate user input into command
const result = await exec(`claude chat "${userInput}"`); // VULNERABLE

// GOOD: Use spawn with args array
const result = spawn('claude', ['chat'], { stdio: 'pipe' });
result.stdin.write(userInput);  // Input via stdin is safe
```

## Risks / Trade-offs

### Risk: CLI Tool Changes
- **Mitigation**: Version detection, graceful degradation

### Risk: Inconsistent Output Formats
- **Mitigation**: Robust parsing, fallback handling

### Risk: Long-running Commands
- **Mitigation**: Timeouts, streaming where possible

### Trade-off: Dependency on User Installing Tools
- **Accept**: Document requirements, check availability

## Open Questions

1. How to discover all installed CLI tools automatically?
   - **Suggestion**: Check common paths, let user configure

2. How to handle CLI tools that need interactive auth?
   - **Suggestion**: Detect, prompt user to run auth command

3. Should we cache CLI availability/auth status?
   - **Suggestion**: Yes, with short TTL (1 minute)

4. How to handle rate limits in CLI tools?
   - **TODO**: Research each tool's rate limiting behavior
