import type { EnhancedProvider, RoutingMethod, ConnectionResult } from '../types/EnhancedProvider';
import { ProviderType } from '../types/EnhancedProvider';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/OpenCodeTypes';

// LiteLLM Gateway Client
class LiteLLMGatewayClient {
  private gatewayEndpoint: string;
  
  constructor(gatewayEndpoint: string) {
    this.gatewayEndpoint = gatewayEndpoint;
  }

  async routeRequest(provider: EnhancedProvider, request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // In a real implementation, this would make requests to the LiteLLM gateway
    // For now, we'll simulate the functionality
    try {
      // This is a placeholder implementation
      // In a real implementation, this would send the request to the LiteLLM gateway
      // which would then forward it to the appropriate provider
      console.log(`Routing request through LiteLLM gateway to provider: ${provider.name}`);
      
      // Example of how this might work:
      // const response = await fetch(`${this.gatewayEndpoint}/v1/chat/completions`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${provider.apiKey}`
      //   },
      //   body: JSON.stringify({
      //     ...request,
      //     provider: provider.id, // Tell the gateway which provider to use
      //   })
      // });
      
      // For simulation purposes, return a mock response
      return {
        id: 'mock-response',
        object: 'chat.completion',
        created: Date.now(),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a simulated response from the LiteLLM gateway.'
          },
          finish_reason: 'stop'
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`LiteLLM gateway request failed: ${errorMessage}`);
    }
  }

  async testConnection(provider: EnhancedProvider): Promise<ConnectionResult> {
    try {
      // Test the connection to the provider through the gateway
      // This would call the gateway to test if it can reach the provider
      console.log(`Testing connection to ${provider.name} via LiteLLM gateway`);
      
      // Mock implementation
      return {
        success: true,
        method: 'gateway',
        responseTime: 150, // ms
        details: { provider: provider.name, gateway: this.gatewayEndpoint }
      };
    } catch (error) {
      return {
        success: false,
        method: 'gateway',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Direct API Client
class DirectAPIClient {
  async makeRequest(provider: EnhancedProvider, request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // In a real implementation, this would make direct requests to the provider API
    // For now, we'll simulate the functionality
    try {
      console.log(`Making direct request to provider: ${provider.baseUrl}`);
      
      // Example of how this might work:
      // const response = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${provider.apiKey}`,
      //     ...provider.customHeaders
      //   },
      //   body: JSON.stringify(request)
      // });
      
      // For simulation purposes, return a mock response
      return {
        id: 'mock-response',
        object: 'chat.completion',
        created: Date.now(),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a simulated response from direct API call.'
          },
          finish_reason: 'stop'
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Direct API request failed: ${errorMessage}`);
    }
  }

  async testConnection(provider: EnhancedProvider): Promise<ConnectionResult> {
    try {
      // Test the direct connection to the provider
      console.log(`Testing direct connection to ${provider.name}`);
      
      // Mock implementation
      return {
        success: true,
        method: 'direct',
        responseTime: 100, // ms
        details: { provider: provider.name, baseUrl: provider.baseUrl }
      };
    } catch (error) {
      return {
        success: false,
        method: 'direct',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Provider Router Implementation
export class ProviderRouter {
  private directClient: DirectAPIClient;
  private gatewayClient: LiteLLMGatewayClient | null = null;
  private providerCache: Map<string, EnhancedProvider>;

  constructor() {
    this.directClient = new DirectAPIClient();
    this.providerCache = new Map();
  }

  // Set the gateway client to use for requests that require it
  setGatewayClient(gatewayEndpoint: string) {
    this.gatewayClient = new LiteLLMGatewayClient(gatewayEndpoint);
  }

  // Determine the best routing method for a provider
  async determineRoutingMethod(provider: EnhancedProvider): Promise<RoutingMethod> {
    // Check if the provider has a specific routing method set
    if (provider.routingMethod !== 'auto') {
      return provider.routingMethod;
    }

    // For Z.ai and other problematic providers, use gateway
    if (this.isProblematicProvider(provider)) {
      return 'gateway';
    }

    // Otherwise, try direct first and fallback if it fails
    return 'direct';
  }

  // Check if a provider is known to have connectivity issues requiring gateway
  private isProblematicProvider(provider: EnhancedProvider): boolean {
    // Common problematic provider indicators
    const problematicDomains = ['z.ai', 'z-ai', 'api.z.ai'];

    return problematicDomains.some(domain =>
      provider.baseUrl.toLowerCase().includes(domain.toLowerCase()) ||
      provider.name.toLowerCase().includes(domain.toLowerCase())
    );
  }

  // Test connectivity for both methods
  async testDirectConnection(provider: EnhancedProvider): Promise<ConnectionResult> {
    return await this.directClient.testConnection(provider);
  }

  async testGatewayConnection(provider: EnhancedProvider): Promise<ConnectionResult> {
    if (!this.gatewayClient) {
      return {
        success: false,
        method: 'gateway',
        error: 'Gateway client not initialized'
      };
    }
    return await this.gatewayClient.testConnection(provider);
  }

  // Execute request with automatic fallback
  async executeRequest(provider: EnhancedProvider, request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Determine the routing method to use
    const routingMethod = await this.determineRoutingMethod(provider);

    // Update provider in cache with latest health status
    this.updateProviderInCache(provider);

    if (routingMethod === 'gateway') {
      if (!this.gatewayClient) {
        throw new Error('Gateway client not configured for gateway routing');
      }
      
      try {
        const result = await this.gatewayClient.routeRequest(provider, request);
        this.updateProviderHealth(provider.id, 'healthy');
        return result;
      } catch (error) {
        // Update health status on failure
        this.updateProviderHealth(provider.id, 'failing');
        throw error;
      }
    } else {
      try {
        const result = await this.directClient.makeRequest(provider, request);
        this.updateProviderHealth(provider.id, 'healthy');
        return result;
      } catch (error) {
        // If direct fails and fallback is enabled, try gateway
        if (provider.routingPreferences.fallbackEnabled && this.gatewayClient) {
          console.log(`Direct connection failed, trying gateway fallback for ${provider.name}`);
          try {
            const result = await this.gatewayClient.routeRequest(provider, request);
            this.updateProviderHealth(provider.id, 'healthy');
            return result;
          } catch (fallbackError) {
            this.updateProviderHealth(provider.id, 'failing');
            throw fallbackError;
          }
        } else {
          this.updateProviderHealth(provider.id, 'failing');
          throw error;
        }
      }
    }
  }

  // Health monitoring
  monitorProviderHealth(provider: EnhancedProvider): void {
    // In a real implementation, this would periodically check provider health
    // For now, we'll just update the last checked time
    provider.lastHealthCheck = new Date();
    this.updateProviderInCache(provider);
  }

  // Update provider in cache
  private updateProviderInCache(provider: EnhancedProvider): void {
    this.providerCache.set(provider.id, { ...provider });
  }

  // Update provider health status
  private updateProviderHealth(providerId: string, status: EnhancedProvider['healthStatus']): void {
    const provider = this.providerCache.get(providerId);
    if (provider) {
      provider.healthStatus = status;
      provider.lastHealthCheck = new Date();
      if (status === 'failing') {
        provider.consecutiveFailures += 1;
      } else {
        provider.consecutiveFailures = 0;
      }
      this.providerCache.set(providerId, provider);
    }
  }

  // Classify provider type
  classifyProvider(provider: EnhancedProvider): keyof typeof ProviderType {
    if (this.isProblematicProvider(provider)) {
      return 'GATEWAY_REQUIRED';
    }

    // This would be determined by testing connectivity in a real implementation
    return 'HYBRID';
  }
}