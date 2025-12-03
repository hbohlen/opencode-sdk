import { BaseCLIProvider, AuthStatus } from './ICLIProvider';
import { CLIProcessManager } from './CLIProcessManager';
import { CLITranslator } from './CLITranslator';
import { CLIOutputParser } from './CLIOutputParser';

/**
 * Claude Code CLI Provider implementation
 * Interfaces with the Claude CLI tool for AI completions
 */
export class ClaudeCodeProvider extends BaseCLIProvider {
  private modelMapping: Record<string, string>;

  constructor(cliPath: string = 'claude', timeout: number = 30000, modelMapping?: Record<string, string>) {
    super(cliPath, timeout);
    this.modelMapping = modelMapping || {
      'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307'
    };
  }

  async executeCommand(command: string, args: string[]): Promise<string> {
    const result = await CLIProcessManager.executeCommand(this.cliPath, [command, ...args], this.timeout);
    
    if (result.exitCode !== 0) {
      throw new Error(`Claude CLI command failed: ${result.stderr || result.stdout}`);
    }
    
    return result.stdout;
  }

  async *executeCommandStream(command: string, args: string[]): AsyncGenerator<string, void, unknown> {
    // Generate the full command with arguments
    const fullArgs = [command, ...args];
    
    for await (const chunk of CLIProcessManager.executeCommandStream(this.cliPath, fullArgs, this.timeout)) {
      yield chunk;
    }
  }

  async isAvailable(): Promise<boolean> {
    return await CLIProcessManager.isCommandAvailable(this.cliPath);
  }

  async getVersion(): Promise<string | null> {
    try {
      // Claude CLI typically uses `claude --version` or `claude version`
      const result = await CLIProcessManager.executeCommand(this.cliPath, ['--version'], this.timeout);
      if (result.exitCode === 0) {
        return result.stdout.trim();
      }
      
      // If --version fails, try `claude version`
      const result2 = await CLIProcessManager.executeCommand(this.cliPath, ['version'], this.timeout);
      if (result2.exitCode === 0) {
        return result2.stdout.trim();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async getAuthStatus(): Promise<AuthStatus> {
    try {
      // Claude CLI typically has an auth status command
      const result = await CLIProcessManager.executeCommand(this.cliPath, ['auth', 'status'], this.timeout);
      
      if (result.exitCode === 0) {
        const authStatus = CLIOutputParser.parseAuthStatus(result.stdout);
        return {
          isAuthenticated: authStatus.isAuthenticated,
          account: authStatus.account,
          expiresAt: authStatus.expiresAt
        };
      }
      
      return {
        isAuthenticated: false
      };
    } catch (error) {
      return {
        isAuthenticated: false
      };
    }
  }

  /**
   * Get available Claude models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const result = await CLIProcessManager.executeCommand(this.cliPath, ['models', 'list'], this.timeout);
      if (result.exitCode === 0) {
        // Parse the output to extract model names
        // This is a simplified parsing - real output format may vary
        const lines = result.stdout.split('\n');
        const models: string[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('NAME') && !trimmed.startsWith('MODEL')) {
            const parts = trimmed.split(/\s+/);
            if (parts[0]) {
              models.push(parts[0]);
            }
          }
        }
        
        return models;
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Send a chat completion request to Claude CLI
   */
  async chatCompletion(request: any, modelName: string): Promise<any> {
    // Map the model name if needed
    const cliModel = this.modelMapping[modelName] || modelName;
    
    // Convert the request to CLI arguments
    const args = CLITranslator.openAIRequestToCLIArgs(request, cliModel);
    
    // Execute the command
    const output = await this.executeCommand('send', args);
    
    // Parse the output to OpenAI format
    return CLITranslator.cliOutputToOpenAIFormat(output, modelName);
  }

  /**
   * Send a streaming chat completion request to Claude CLI
   */
  async *chatCompletionStream(request: any, modelName: string): AsyncGenerator<string, void, unknown> {
    // Map the model name if needed
    const cliModel = this.modelMapping[modelName] || modelName;
    
    // Convert the request to CLI arguments for streaming
    const args = CLITranslator.openAIRequestToCLIArgsForStreaming(request, cliModel);
    
    // Execute the command with streaming
    for await (const chunk of this.executeCommandStream('send', args)) {
      yield chunk;
    }
  }
}