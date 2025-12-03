/**
 * Interface for CLI-based AI providers
 * Defines the contract for interacting with CLI tools that provide AI capabilities
 */
export interface ICLIProvider {
  /**
   * Execute a command with the CLI tool
   * @param command The command to execute
   * @param args Arguments to pass to the command
   * @returns Promise resolving to the command output
   */
  executeCommand(command: string, args: string[]): Promise<string>;

  /**
   * Execute a command with streaming output
   * @param command The command to execute
   * @param args Arguments to pass to the command
   * @returns Async generator yielding output chunks
   */
  executeCommandStream(command: string, args: string[]): AsyncGenerator<string, void, unknown>;

  /**
   * Check if the CLI tool is available and accessible
   * @returns Promise resolving to true if available, false otherwise
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the version of the CLI tool
   * @returns Promise resolving to the version string
   */
  getVersion(): Promise<string | null>;

  /**
   * Check the OAuth authentication status
   * @returns Promise resolving to authentication status
   */
  getAuthStatus(): Promise<AuthStatus>;
}

/**
 * Authentication status for CLI providers
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  expiresAt?: Date;
  account?: string;
}

/**
 * Base class for CLI provider implementations
 */
export abstract class BaseCLIProvider implements ICLIProvider {
  protected cliPath: string;
  protected timeout: number;

  constructor(cliPath: string, timeout: number = 30000) {
    this.cliPath = cliPath;
    this.timeout = timeout;
  }

  abstract executeCommand(command: string, args: string[]): Promise<string>;
  abstract executeCommandStream(command: string, args: string[]): AsyncGenerator<string, void, unknown>;
  abstract isAvailable(): Promise<boolean>;
  abstract getVersion(): Promise<string | null>;
  abstract getAuthStatus(): Promise<AuthStatus>;
}