import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/client';

// Create a singleton instance of the OpenCode SDK
let opencodeInstance: OpencodeClient | null = null;

// Initialize the OpenCode SDK with the provided configuration
export const initializeOpenCode = async (config?: any): Promise<OpencodeClient> => {
  if (!opencodeInstance) {
    opencodeInstance = createOpencodeClient(config);
  }
  return opencodeInstance;
};

// Get the existing OpenCode instance (throws if not initialized)
export const getOpenCode = (): OpencodeClient => {
  if (!opencodeInstance) {
    throw new Error('OpenCode SDK not initialized. Call initializeOpenCode first.');
  }
  return opencodeInstance;
};

// Reset the OpenCode instance (useful for testing)
export const resetOpenCode = (): void => {
  opencodeInstance = null;
};