import { CLIProcessManager } from './CLIProcessManager';

/**
 * Health check utility for CLI tools
 */
export class CLIHealthCheck {
  /**
   * Check if a CLI tool is available and functional
   * @param command The command to check
   * @param testArgs Arguments to use for testing (defaults to ['--help'] or similar)
   * @returns Health status information
   */
  static async checkHealth(command: string, testArgs: string[] = ['--help']): Promise<CLIHealthStatus> {
    const isAvailable = await CLIProcessManager.isCommandAvailable(command);
    
    if (!isAvailable) {
      return {
        available: false,
        version: null,
        error: 'Command not found in PATH',
        authenticated: false
      };
    }

    try {
      // Get version if possible
      let version: string | null = null;
      try {
        version = await CLIProcessManager.getVersion(command);
      } catch (error) {
        // If version check fails, continue with health check
        console.warn(`Could not get version for ${command}:`, error);
      }

      // Test basic functionality by running a simple command with timeout
      const result = await CLIProcessManager.executeCommand(command, testArgs, 10000);
      
      return {
        available: true,
        version,
        error: null,
        authenticated: result.exitCode === 0
      };
    } catch (error) {
      return {
        available: true, // Command exists in PATH
        version: null, // But has some other issue
        error: error instanceof Error ? error.message : String(error),
        authenticated: false
      };
    }
  }

  /**
   * Check if a CLI tool is properly authenticated
   * @param command The command to check
   * @param authCheckArgs Arguments to use for authentication check (e.g., ['auth', 'status'])
   * @returns Authentication status
   */
  static async checkAuthentication(command: string, authCheckArgs: string[]): Promise<boolean> {
    try {
      const result = await CLIProcessManager.executeCommand(command, authCheckArgs, 10000);
      return result.exitCode === 0;
    } catch (error) {
      return false;
    }
  }
}

export interface CLIHealthStatus {
  available: boolean;
  version: string | null;
  error: string | null;
  authenticated: boolean;
}