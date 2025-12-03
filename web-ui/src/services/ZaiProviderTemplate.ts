import type { EnhancedProvider } from '../types/EnhancedProvider';

// Z.ai configuration template with gateway routing
export const ZAI_PROVIDER_TEMPLATE: EnhancedProvider = {
  id: 'zai-coding-plan-api',
  name: 'Z.ai Coding Plan API',
  baseUrl: 'https://api.z.ai/api/coding/paas/v4',
  apiKey: '', // To be filled by user
  routingMethod: 'gateway', // Force gateway routing due to CORS issues
  gatewayEndpoint: '', // To be configured by user
  routingPreferences: {
    preferDirect: false, // Skip direct attempts for Z.ai
    fallbackEnabled: true, // Enable fallback to other methods
    healthCheckInterval: 30000, // 30 second health checks
  },
  healthStatus: 'unknown',
  lastHealthCheck: undefined,
  consecutiveFailures: 0,
  customHeaders: {
    'Content-Type': 'application/json',
    'User-Agent': 'OpenCode-LiteLLM-Gateway/1.0',
  },
  models: [
    {
      id: 'zai-coding-model',
      name: 'Z.ai Coding Model',
      reasoning: true,
      tool_call: true,
      limit: {
        context: 128000, // 128k tokens
        output: 4096,
      },
      options: {
        temperature: 0.35,
        top_p: 0.9,
        max_tokens: 4096,
        stream: true,
      },
    }
  ],
};

// Function to create a Z.ai provider configuration with user's API key
export const createZaiProvider = (apiKey: string, gatewayEndpoint: string): EnhancedProvider => {
  return {
    ...ZAI_PROVIDER_TEMPLATE,
    apiKey,
    gatewayEndpoint,
    id: `zai-provider-${Date.now()}`, // Unique ID for this instance
  };
};