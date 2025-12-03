// Enhanced provider interface with routing capabilities
export interface EnhancedProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  // New routing properties
  routingMethod: 'auto' | 'direct' | 'gateway';
  gatewayEndpoint?: string;
  routingPreferences: {
    preferDirect: boolean;
    fallbackEnabled: boolean;
    healthCheckInterval: number;
  };
  // Connection health
  healthStatus: 'healthy' | 'degraded' | 'failing' | 'unknown';
  lastHealthCheck?: Date;
  consecutiveFailures: number;
  customHeaders?: Record<string, string>;
  models?: Array<{
    id: string;
    name: string;
    reasoning?: boolean;
    tool_call?: boolean;
    limit?: {
      context: number;
      output: number;
    };
    options?: Record<string, string | number | boolean>;
  }>;
}

// Provider type classification
export const ProviderType = {
  DIRECT_API: 'direct-api', // OpenAI, Anthropic, etc.
  GATEWAY_REQUIRED: 'gateway-required', // Z.ai, problematic APIs
  HYBRID: 'hybrid', // Works both ways, auto-detect
  LEGACY: 'legacy', // Keep original behavior
} as const;

export type ProviderType = keyof typeof ProviderType;

// Routing method decision
export type RoutingMethod = 'direct' | 'gateway';

// Connection details interface
export interface ConnectionDetails {
  provider: string;
  gateway?: string;
  baseUrl?: string;
}

// Connection result interface
export interface ConnectionResult {
  success: boolean;
  method: RoutingMethod;
  responseTime?: number;
  error?: string;
  details?: ConnectionDetails;
}