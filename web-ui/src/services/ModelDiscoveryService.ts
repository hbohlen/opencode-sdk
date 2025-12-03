import type { EnhancedProvider } from '../types/EnhancedProvider';

// Model interface definition
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number; // Maximum context window in tokens
  maxOutput?: number; // Maximum output tokens
  capabilities?: string[]; // e.g., ['text', 'vision', 'audio']
  pricing?: {
    inputCost: number; // Cost per million tokens
    outputCost: number; // Cost per million tokens
  };
  providerId: string; // Reference to the provider
}

// Model discovery service
export class ModelDiscoveryService {
  constructor() {}

  // Extract capabilities from model data
  private extractCapabilities(model: any): string[] {
    const capabilities: string[] = ['text']; // Default capability

    if (model.vision) capabilities.push('vision');
    if (model.audio) capabilities.push('audio');
    if (model.function_calling || model.functions) capabilities.push('function_calling');
    if (model.reasoning) capabilities.push('reasoning');
    if (model.coding) capabilities.push('coding');

    return capabilities;
  }

  // Test provider connection and validate configuration
  async testProviderConnection(
    provider: EnhancedProvider
  ): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      if (!provider.baseUrl) {
        throw new Error('Base URL is required for provider configuration');
      }

      if (!provider.apiKey) {
        throw new Error('API key is required for provider configuration');
      }

      // Test basic connectivity
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      };

      // Add custom headers if provided
      if (provider.customHeaders) {
        Object.assign(headers, provider.customHeaders);
      }

      const testUrl = `${provider.baseUrl}/v1/models`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: `Successfully connected to ${provider.name}`,
        details: {
          statusCode: response.status,
          modelCount: data.data?.length || data.length || 0,
          responseTime: Date.now(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Connection test failed for ${provider.name}: ${errorMessage}`,
      };
    }
  }

  // Discover models from a provider via direct API or gateway
  async discoverModels(provider: EnhancedProvider): Promise<ModelInfo[]> {
    // Validate provider configuration
    if (!provider.baseUrl) {
      throw new Error('Base URL is required for model discovery');
    }

    if (!provider.apiKey) {
      throw new Error('API key is required for model discovery');
    }

    // Route to appropriate discovery method
    if (provider.routingMethod === 'gateway' && provider.gatewayEndpoint) {
      return await this.discoverModelsViaGateway(provider);
    } else {
      return await this.discoverModelsDirect(provider);
    }
  }

  // Discover models via gateway
  private async discoverModelsViaGateway(provider: EnhancedProvider): Promise<ModelInfo[]> {
    try {
      if (!provider.gatewayEndpoint) {
        throw new Error('Gateway endpoint is required for gateway routing');
      }

      console.log(
        `Discovering models for ${provider.name} via gateway at ${provider.gatewayEndpoint}`
      );

      // Call the LiteLLM gateway to get models from the provider
      const gatewayUrl = `${provider.gatewayEndpoint}/v1/models`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add custom headers if provided
      if (provider.customHeaders) {
        Object.assign(headers, provider.customHeaders);
      }

      // Add authorization if API key is provided
      if (provider.apiKey) {
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
      }

      const response = await fetch(gatewayUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Gateway API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        // OpenAI-compatible format
        return data.data.map((model: any) => ({
          id: model.id,
          name: model.id,
          description: model.description || '',
          contextWindow: model.context_window || model.contextLength || 4096,
          maxOutput: model.max_output_tokens || model.max_tokens || 4096,
          capabilities: this.extractCapabilities(model),
          providerId: provider.id,
        }));
      } else if (Array.isArray(data)) {
        // Direct array format
        return data.map((model: any) => ({
          id: model.id || model.name,
          name: model.name || model.id,
          description: model.description || '',
          contextWindow: model.context_window || model.contextLength || 4096,
          maxOutput: model.max_output_tokens || model.max_tokens || 4096,
          capabilities: this.extractCapabilities(model),
          providerId: provider.id,
        }));
      } else {
        throw new Error('Invalid response format from gateway');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error discovering models via gateway for ${provider.name}:`, error);
      throw new Error(`Model discovery via gateway failed: ${errorMessage}`);
    }
  }

  // Discover models via direct API
  private async discoverModelsDirect(provider: EnhancedProvider): Promise<ModelInfo[]> {
    try {
      console.log(`Discovering models for ${provider.name} via direct API at ${provider.baseUrl}`);

      if (!provider.baseUrl) {
        throw new Error('Base URL is required for direct API calls');
      }

      // Call the provider's models endpoint directly
      const apiUrl = `${provider.baseUrl}/v1/models`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      };

      // Add custom headers if provided
      if (provider.customHeaders) {
        Object.assign(headers, provider.customHeaders);
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Direct API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        // OpenAI-compatible format
        return data.data.map((model: any) => ({
          id: model.id,
          name: model.id,
          description: model.description || '',
          contextWindow: model.context_window || model.contextLength || 4096,
          maxOutput: model.max_output_tokens || model.max_tokens || 4096,
          capabilities: this.extractCapabilities(model),
          providerId: provider.id,
        }));
      } else if (Array.isArray(data)) {
        // Direct array format
        return data.map((model: any) => ({
          id: model.id || model.name,
          name: model.name || model.id,
          description: model.description || '',
          contextWindow: model.context_window || model.contextLength || 4096,
          maxOutput: model.max_output_tokens || model.max_tokens || 4096,
          capabilities: this.extractCapabilities(model),
          providerId: provider.id,
        }));
      } else {
        throw new Error('Invalid response format from provider');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error discovering models directly for ${provider.name}:`, error);
      throw new Error(`Direct model discovery failed: ${errorMessage}`);
    }
  }

  // Get models by provider ID
  async getModelsByProviderId(
    providers: EnhancedProvider[],
    providerId: string
  ): Promise<ModelInfo[]> {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    return await this.discoverModels(provider);
  }

  // Get all models from all providers
  async getAllModels(providers: EnhancedProvider[]): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];

    for (const provider of providers) {
      try {
        const providerModels = await this.discoverModels(provider);
        allModels.push(...providerModels);
      } catch (error) {
        console.error(`Failed to discover models for provider ${provider.name}:`, error);
        // Continue with other providers even if one fails
      }
    }

    return allModels;
  }

  // Refresh models for a provider
  async refreshModels(provider: EnhancedProvider): Promise<ModelInfo[]> {
    // Clear any cached models and re-discover
    return await this.discoverModels(provider);
  }
}
