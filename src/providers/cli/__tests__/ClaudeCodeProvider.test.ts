import { ClaudeCodeProvider } from '../ClaudeCodeProvider';
import { CLIProcessManager } from '../CLIProcessManager';

// Mock the CLIProcessManager to avoid actual CLI calls during testing
jest.mock('../CLIProcessManager');

describe('ClaudeCodeProvider', () => {
  let claudeProvider: ClaudeCodeProvider;

  beforeEach(() => {
    claudeProvider = new ClaudeCodeProvider('claude', 10000);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true if claude CLI is available', async () => {
      // Mock the isCommandAvailable method to return true
      (CLIProcessManager.isCommandAvailable as jest.Mock).mockResolvedValue(true);

      const result = await claudeProvider.isAvailable();
      expect(result).toBe(true);
      expect(CLIProcessManager.isCommandAvailable).toHaveBeenCalledWith('claude');
    });

    it('should return false if claude CLI is not available', async () => {
      // Mock the isCommandAvailable method to return false
      (CLIProcessManager.isCommandAvailable as jest.Mock).mockResolvedValue(false);

      const result = await claudeProvider.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('getVersion', () => {
    it('should return version when claude --version succeeds', async () => {
      const versionOutput = 'claude/0.1.0 linux-x64 node-20.10.0';
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: versionOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await claudeProvider.getVersion();
      expect(result).toBe(versionOutput.trim());
      expect(CLIProcessManager.executeCommand).toHaveBeenCalledWith('claude', ['--version'], 10000);
    });

    it('should try alternative version command if first fails', async () => {
      // First call fails, second succeeds
      (CLIProcessManager.executeCommand as jest.Mock)
        .mockResolvedValueOnce({
          stdout: '',
          stderr: 'error',
          exitCode: 1
        })
        .mockResolvedValueOnce({
          stdout: '0.1.0',
          stderr: '',
          exitCode: 0
        });

      const result = await claudeProvider.getVersion();
      expect(result).toBe('0.1.0');
      expect(CLIProcessManager.executeCommand).toHaveBeenNthCalledWith(1, 'claude', ['--version'], 10000);
      expect(CLIProcessManager.executeCommand).toHaveBeenNthCalledWith(2, 'claude', ['version'], 10000);
    });

    it('should return null if both version commands fail', async () => {
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: '',
        stderr: 'error',
        exitCode: 1
      });

      const result = await claudeProvider.getVersion();
      expect(result).toBeNull();
    });
  });

  describe('getAuthStatus', () => {
    it('should return authenticated status when auth check succeeds', async () => {
      const authOutput = 'Status: authenticated\nAccount: user@example.com';
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: authOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await claudeProvider.getAuthStatus();
      expect(result).toEqual({
        isAuthenticated: true,
        account: 'user@example.com'
      });
    });

    it('should return not authenticated status when auth check fails', async () => {
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: 'Not authenticated',
        stderr: '',
        exitCode: 0
      });

      const result = await claudeProvider.getAuthStatus();
      expect(result).toEqual({
        isAuthenticated: false
      });
    });

    it('should return not authenticated status when command fails', async () => {
      (CLIProcessManager.executeCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

      const result = await claudeProvider.getAuthStatus();
      expect(result).toEqual({
        isAuthenticated: false
      });
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', async () => {
      const modelListOutput = `NAME                                    MAX-TOKENS  DESCRIPTION
claude-3-5-sonnet-20241022    4096        The most intelligent Claude 3.5 Sonnet model
claude-3-opus-20240229        4096        The most powerful model for highly complex tasks
claude-3-sonnet-20240229      4096        Ideal balance of intelligence and speed
claude-3-haiku-20240307      4096        Fastest and most compact model for near-instant responses`;
      
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: modelListOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await claudeProvider.getAvailableModels();
      expect(result).toEqual([
        'claude-3-5-sonnet-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ]);
    });

    it('should return empty array if command fails', async () => {
      (CLIProcessManager.executeCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

      const result = await claudeProvider.getAvailableModels();
      expect(result).toEqual([]);
    });
  });

  describe('chatCompletion', () => {
    it('should execute chat completion and return formatted response', async () => {
      const mockRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        temperature: 0.7
      };
      
      const cliOutput = 'Hello! How can I assist you today?';
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: cliOutput,
        stderr: '',
        exitCode: 0
      });

      const result = await claudeProvider.chatCompletion(mockRequest, 'claude-3-5-sonnet');
      
      expect(CLIProcessManager.executeCommand).toHaveBeenCalledWith(
        'claude', 
        ['send', '--model', 'claude-3-5-sonnet-20241022', '--prompt', 'user: Hello', '--temperature', '0.7'], 
        10000
      );
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('object', 'chat.completion');
      expect(result).toHaveProperty('model', 'claude-3-5-sonnet');
      expect(result.choices[0].message.content).toBe(cliOutput);
    });

    it('should throw error if CLI command fails', async () => {
      const mockRequest = {
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      };
      
      (CLIProcessManager.executeCommand as jest.Mock).mockResolvedValue({
        stdout: '',
        stderr: 'Error occurred',
        exitCode: 1
      });

      await expect(claudeProvider.chatCompletion(mockRequest, 'claude-3-5-sonnet'))
        .rejects
        .toThrow('Claude CLI command failed: Error occurred');
    });
  });
});