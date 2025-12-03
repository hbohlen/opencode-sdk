import { createContext } from 'react';
import type { OpencodeClient } from '@opencode-ai/sdk/client';
import type { EnhancedProvider } from '../types/EnhancedProvider';
import type { ProviderRouter } from '../services/ProviderRouter';
import type { ConnectionHealthMonitor } from '../services/ConnectionHealthMonitor';
import type { ModelDiscoveryService, ModelInfo } from '../services/ModelDiscoveryService';
import type { OpenCodeConfig, SessionManager } from '../types/OpenCodeTypes';

export interface OpenCodeContextType {
  opencode: OpencodeClient | null;
  isLoading: boolean;
  error: string | null;
  initialize: (config?: OpenCodeConfig) => Promise<void>;
  sessionManager: SessionManager | null;
  providerRouter: ProviderRouter | null;
  providers: EnhancedProvider[];
  addProvider: (provider: EnhancedProvider) => void;
  updateProvider: (providerId: string, updates: Partial<EnhancedProvider>) => void;
  removeProvider: (providerId: string) => void;
  getProvider: (providerId: string) => EnhancedProvider | undefined;
  healthMonitor: ConnectionHealthMonitor | null;
  refreshProviderHealth: (providerId: string) => Promise<void>;
  modelDiscoveryService: ModelDiscoveryService;
  discoverModels: (providerId: string) => Promise<ModelInfo[]>;
}

export const OpenCodeContext = createContext<OpenCodeContextType | undefined>(undefined);
