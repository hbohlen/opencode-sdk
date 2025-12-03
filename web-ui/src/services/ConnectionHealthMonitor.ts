import type { EnhancedProvider, ConnectionResult } from '../types/EnhancedProvider';

export interface HealthMonitorConfig {
  checkInterval: number; // ms between health checks
  timeout: number; // request timeout in ms
  maxConsecutiveFailures: number; // threshold to mark as failing
  retryDelay: number; // delay before retry after failure
}

export class ConnectionHealthMonitor {
  private providers: Map<string, EnhancedProvider> = new Map();
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private config: HealthMonitorConfig;
  private onHealthChange: ((providerId: string, healthStatus: EnhancedProvider['healthStatus']) => void) | null = null;

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = {
      checkInterval: config?.checkInterval || 30000, // 30 seconds
      timeout: config?.timeout || 10000, // 10 seconds
      maxConsecutiveFailures: config?.maxConsecutiveFailures || 3,
      retryDelay: config?.retryDelay || 5000, // 5 seconds
    };
  }

  // Add a provider to monitor
  addProvider(provider: EnhancedProvider): void {
    this.providers.set(provider.id, { ...provider });
  }

  // Remove a provider from monitoring
  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  // Update a provider configuration
  updateProvider(provider: EnhancedProvider): void {
    this.providers.set(provider.id, { ...provider });
  }

  // Get a provider
  getProvider(providerId: string): EnhancedProvider | undefined {
    return this.providers.get(providerId);
  }

  // Set callback for health status changes
  setOnHealthChange(callback: (providerId: string, healthStatus: EnhancedProvider['healthStatus']) => void): void {
    this.onHealthChange = callback;
  }

  // Start health monitoring
  start(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkInterval);
  }

  // Stop health monitoring
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Perform health checks for all registered providers
  private async performHealthChecks(): Promise<void> {
    for (const provider of this.providers.values()) {
      await this.checkProviderHealth(provider);
    }
  }

  // Check health of a specific provider
  private async checkProviderHealth(provider: EnhancedProvider): Promise<void> {
    try {
      // This is a simplified check - in a real implementation, we would 
      // test the actual connection to the provider
      const result = await this.testConnection(provider);

      // Update provider health status
      const updatedProvider = { ...provider };
      updatedProvider.lastHealthCheck = new Date();
      
      if (result.success) {
        updatedProvider.healthStatus = 'healthy';
        updatedProvider.consecutiveFailures = 0;
      } else {
        updatedProvider.healthStatus = 'failing';
        updatedProvider.consecutiveFailures += 1;
        
        // If too many consecutive failures, mark as degraded
        if (updatedProvider.consecutiveFailures >= this.config.maxConsecutiveFailures) {
          updatedProvider.healthStatus = 'degraded';
        }
      }

      // Update provider in the map
      this.providers.set(provider.id, updatedProvider);

      // Call the health change callback if provided and status changed
      if (this.onHealthChange && provider.healthStatus !== updatedProvider.healthStatus) {
        this.onHealthChange(provider.id, updatedProvider.healthStatus);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error checking health for provider ${provider.name}:`, errorMessage);
    }
  }

  // Test connection to a provider (simplified implementation)
  private async testConnection(provider: EnhancedProvider): Promise<ConnectionResult> {
    // This is a mock implementation
    // In reality, this would make a real connection test to the provider
    try {
      // For gateway-routed providers, we'd test the gateway connection
      if (provider.routingMethod === 'gateway' && provider.gatewayEndpoint) {
        // Simulate testing gateway connection
        console.log(`Testing gateway connection for ${provider.name}`);
        // In a real implementation, this would make a request to the gateway
        // to verify it can route to the target provider
        return {
          success: true,
          method: 'gateway',
          responseTime: 150, // ms
        };
      } else {
        // Simulate testing direct connection
        console.log(`Testing direct connection for ${provider.name}`);
        // In a real implementation, this would make a test request to the provider
        return {
          success: true,
          method: 'direct',
          responseTime: 100, // ms
        };
      }
    } catch (error) {
      return {
        success: false,
        method: provider.routingMethod as 'direct' | 'gateway',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Get all providers with their health status
  getAllProvidersWithHealth(): EnhancedProvider[] {
    return Array.from(this.providers.values());
  }

  // Get providers by health status
  getProvidersByHealthStatus(status: EnhancedProvider['healthStatus']): EnhancedProvider[] {
    return Array.from(this.providers.values()).filter(p => p.healthStatus === status);
  }

  // Get the current health monitoring configuration
  getConfig(): HealthMonitorConfig {
    return { ...this.config };
  }

  // Update the health monitoring configuration
  updateConfig(newConfig: Partial<HealthMonitorConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };

    // Restart monitoring with new config if currently running
    if (this.healthCheckInterval) {
      this.stop();
      this.start();
    }
  }
  
  // Perform a one-time health check for a specific provider
  async checkProviderOnce(providerId: string): Promise<ConnectionResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    return await this.testConnection(provider);
  }
}