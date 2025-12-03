import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

/**
 * Manager for executing CLI processes with proper timeout handling and error management
 */
export class CLIProcessManager {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Execute a CLI command and return the output
   * @param command The command to execute
   * @param args Arguments to pass to the command
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to stdout
   */
  static async executeCommand(
    command: string,
    args: string[],
    timeout: number = CLIProcessManager.DEFAULT_TIMEOUT
  ): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timer = setTimeout(() => {
        if (process.kill(childProcess.pid)) {
          reject(new Error(`Command '${command}' timed out after ${timeout}ms`));
        }
      }, timeout);

      const childProcess: ChildProcessWithoutNullStreams = spawn(command, args);

      let stdout = '';
      let stderr = '';

      // Collect stdout
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process exit
      childProcess.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code
        });
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  /**
   * Execute a CLI command with streaming output
   * @param command The command to execute
   * @param args Arguments to pass to the command
   * @param timeout Timeout in milliseconds
   * @returns Async generator yielding output chunks
   */
  static executeCommandStream(
    command: string,
    args: string[],
    timeout: number = CLIProcessManager.DEFAULT_TIMEOUT
  ): AsyncGenerator<string, void, unknown> {
    return (async function*() {
      // Create a promise that resolves when the process completes
      let resolve: () => void;
      let reject: (reason: any) => void;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      
      // Set up timeout
      const timer = setTimeout(() => {
        reject(new Error(`Command '${command}' timed out after ${timeout}ms`));
      }, timeout);

      const childProcess: ChildProcessWithoutNullStreams = spawn(command, args);

      // Stream stdout in chunks
      childProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        yield chunk;
      });

      // Handle stderr
      childProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        yield chunk; // We'll yield stderr as well, caller can handle appropriately
      });

      // Handle process exit
      childProcess.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`Command '${command}' exited with code ${code}`));
        } else {
          resolve();
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      // Wait for the process to complete
      await promise;
    })();
  }

  /**
   * Check if a CLI tool is available in PATH
   * @param command The command to check
   * @returns Promise resolving to true if available, false otherwise
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      // On Unix systems, we can use 'which' command
      // On Windows, we use 'where'
      const isWindows = process.platform === 'win32';
      const checkCommand = isWindows ? 'where' : 'which';
      const { executeCommand } = CLIProcessManager;
      
      const result = await executeCommand(checkCommand, [command]);
      return result.exitCode === 0;
    } catch (error) {
      // If the command isn't found, isCommandAvailable will return false
      return false;
    }
  }

  /**
   * Get the version of a CLI tool
   * @param command The command to get version for
   * @param versionArgs Arguments to pass to get version (usually ['--version'] or ['version'])
   * @returns Promise resolving to version string or null if not available
   */
  static async getVersion(command: string, versionArgs: string[] = ['--version']): Promise<string | null> {
    try {
      const result = await CLIProcessManager.executeCommand(command, versionArgs);
      if (result.exitCode === 0) {
        // Clean up the version string by removing extra whitespace and newlines
        return result.stdout.trim();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}