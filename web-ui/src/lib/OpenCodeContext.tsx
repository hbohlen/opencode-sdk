import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { OpencodeClient } from '@opencode-ai/sdk/client';
import { initializeOpenCode } from './opencode-client';
import { ProviderRouter } from '../services/ProviderRouter';
import type { EnhancedProvider } from '../types/EnhancedProvider';
import { ConnectionHealthMonitor } from '../services/ConnectionHealthMonitor';
import { ModelDiscoveryService } from '../services/ModelDiscoveryService';
import type { OpenCodeConfig, SessionManager } from '../types/OpenCodeTypes';
import { OpenCodeContext } from './OpenCodeContextDef';

interface OpenCodeProviderProps {
  children: ReactNode;
}

export const OpenCodeProvider: React.FC<OpenCodeProviderProps> = ({ children }) => {
  const [opencode, setOpencode] = useState<OpencodeClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(null);
  const [providerRouter, setProviderRouter] = useState<ProviderRouter | null>(null);
  const [providers, setProviders] = useState<EnhancedProvider[]>([]);
  const [healthMonitor, setHealthMonitor] = useState<ConnectionHealthMonitor | null>(null);
  const modelDiscoveryService = useMemo(() => new ModelDiscoveryService(), []);

  // Initialize OpenCode SDK, provider router, and health monitor
  const initialize = useCallback(async (config?: OpenCodeConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize SDK with default config (SDK doesn't use our app config)
      if (config) {
        console.warn(
          '[OpenCodeProvider] The config parameter is ignored by initializeOpenCode(). SDK will use its default configuration.'
        );
      }
      const instance = await initializeOpenCode();
      setOpencode(instance);

      // Initialize provider router
      const router = new ProviderRouter();

      // If a gateway endpoint is provided in config, set it up
      if (config?.gatewayEndpoint) {
        router.setGatewayClient(config.gatewayEndpoint);
      }

      setProviderRouter(router);

      // Initialize health monitor
      const monitor = new ConnectionHealthMonitor({
        checkInterval: config?.healthCheckInterval || 30000, // 30 seconds
        timeout: config?.timeout || 10000, // 10 seconds
        maxConsecutiveFailures: config?.maxConsecutiveFailures || 3,
        retryDelay: config?.retryDelay || 5000, // 5 seconds
      });

      // Set callback for health status changes
      monitor.setOnHealthChange((providerId, healthStatus) => {
        setProviders(prev =>
          prev.map(p =>
            p.id === providerId ? { ...p, healthStatus } : p
          )
        );
      });

      setHealthMonitor(monitor);
      monitor.start();

      // Initialize session management
      // This is a placeholder - actual implementation would depend on SDK capabilities
      setSessionManager({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize OpenCode SDK';
      setError(errorMessage);
      console.error('OpenCode initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new provider
  const addProvider = (provider: EnhancedProvider) => {
    setProviders(prev => [...prev, provider]);

    // Add to health monitor if it exists
    if (healthMonitor) {
      healthMonitor.addProvider(provider);
    }
  };

  // Update an existing provider
  const updateProvider = (providerId: string, updates: Partial<EnhancedProvider>) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === providerId ? { ...p, ...updates } : p
      )
    );

    // Update in health monitor if it exists
    if (healthMonitor) {
      const updatedProvider = { ...getProvider(providerId), ...updates } as EnhancedProvider;
      healthMonitor.updateProvider(updatedProvider);
    }
  };

  // Remove a provider
  const removeProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));

    // Remove from health monitor if it exists
    if (healthMonitor) {
      healthMonitor.removeProvider(providerId);
    }
  };

  // Get a provider by ID
  const getProvider = (providerId: string) => {
    return providers.find(p => p.id === providerId);
  };

  // Refresh health status for a specific provider
  const refreshProviderHealth = async (providerId: string) => {
    if (healthMonitor) {
      const result = await healthMonitor.checkProviderOnce(providerId);
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId
            ? {
                ...p,
                healthStatus: result.success ? 'healthy' : 'failing',
                lastHealthCheck: new Date()
              }
            : p
        )
      );
    }
  };

  // Discover models for a specific provider
  const discoverModels = async (providerId: string) => {
    const provider = getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    return await modelDiscoveryService.discoverModels(provider);
  };

  // Initialize on component mount with default config
  useEffect(() => {
    const init = async () => {
      await initialize();
    };
    init();
  }, [initialize]);

  // Clean up health monitor on unmount
  useEffect(() => {
    return () => {
      if (healthMonitor) {
        healthMonitor.stop();
      }
    };
  }, [healthMonitor]);

  const value = {
    opencode,
    isLoading,
    error,
    initialize,
    sessionManager,
    providerRouter,
    providers,
    addProvider,
    updateProvider,
    removeProvider,
    getProvider,
    healthMonitor,
    refreshProviderHealth,
    modelDiscoveryService,
    discoverModels,
  };

  return (
    <OpenCodeContext.Provider value={value}>
      {children}
    </OpenCodeContext.Provider>
  );
};