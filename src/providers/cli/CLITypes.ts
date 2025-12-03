/**
 * Types for CLI provider configuration
 */

export interface CLIProviderConfig {
  /** The name of the provider */
  name: string;
  
  /** The CLI command to execute */
  command: string;
  
  /** Path to the CLI executable (optional, will search in PATH if not provided) */
  path?: string;
  
  /** Default arguments to pass to the CLI */
  defaultArgs?: string[];
  
  /** Timeout for CLI operations in milliseconds */
  timeout?: number;
  
  /** Arguments to use for version checking */
  versionArgs?: string[];
  
  /** Arguments to use for authentication status checking */
  authCheckArgs: string[];
  
  /** Model mapping - maps standard model names to CLI-specific models */
  modelMapping?: Record<string, string>;
}

export interface CLIProviderType {
  type: 'cli';
  config: CLIProviderConfig;
}