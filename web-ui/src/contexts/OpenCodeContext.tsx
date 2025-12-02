import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { createOpencodeClient } from "@opencode-ai/sdk/client";

// Provider and Model data structures
export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  authType: "bearer" | "api-key" | "custom";
  customHeaders?: Record<string, string>;
  isActive: boolean;
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  contextLength?: number;
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  supportsFunctionCalling?: boolean;
  maxTokens?: number;
  capabilities: string[];
}

export interface ModelDiscoveryResult {
  models: Model[];
  error?: string;
}

interface OpenCodeContextType {
  client: ReturnType<typeof createOpencodeClient> | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  providers: Provider[];
  selectedProvider: Provider | null;
  selectedModel: Model | null;
  availableModels: Model[];
  connect: (apiKey: string, endpoint?: string) => Promise<void>;
  disconnect: () => void;
  addProvider: (provider: Omit<Provider, "id">) => void;
  removeProvider: (providerId: string) => void;
  updateProvider: (providerId: string, updates: Partial<Provider>) => void;
  selectProvider: (providerId: string) => void;
  selectModel: (modelId: string) => void;
  discoverModels: (providerId: string) => Promise<ModelDiscoveryResult>;
  testConnection: (
    providerId: string,
    modelId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const OpenCodeContext = createContext<OpenCodeContextType | undefined>(
  undefined,
);

interface OpenCodeProviderProps {
  children: ReactNode;
}

export function OpenCodeProvider({ children }: OpenCodeProviderProps) {
  const [client, setClient] = useState<ReturnType<
    typeof createOpencodeClient
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provider and model state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProviderState] =
    useState<Provider | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);

  // Load providers from localStorage on mount
  useEffect(() => {
    const savedProviders = localStorage.getItem("opencode-providers");
    if (savedProviders) {
      try {
        const parsed = JSON.parse(savedProviders);
        setProviders(parsed);
        // Set first active provider as selected if none selected
        const activeProvider = parsed.find((p: Provider) => p.isActive);
        if (activeProvider && !selectedProvider) {
          setSelectedProviderState(activeProvider);
        }
      } catch (err) {
        console.error("Failed to load providers from localStorage:", err);
      }
    }
  }, []);

  const saveProvidersToStorage = (newProviders: Provider[]) => {
    localStorage.setItem("opencode-providers", JSON.stringify(newProviders));
  };

  const connect = async (apiKey: string, endpoint?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newClient = createOpencodeClient({
        baseUrl: endpoint || "https://api.opencode-ai.com",
      });

      // Set authentication
      await newClient.auth.set({
        body: {
          type: "api",
          key: apiKey,
        },
        path: {
          id: "default",
        },
      });

      // Test the connection by listing sessions
      await newClient.session.list();

      setClient(newClient);
      setIsConnected(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to OpenCode",
      );
      setIsConnected(false);
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setClient(null);
    setIsConnected(false);
    setError(null);
  };

  const addProvider = (providerData: Omit<Provider, "id">) => {
    const newProvider: Provider = {
      ...providerData,
      id: Date.now().toString(),
    };
    const newProviders = [...providers, newProvider];
    setProviders(newProviders);
    saveProvidersToStorage(newProviders);
  };

  const removeProvider = (providerId: string) => {
    const newProviders = providers.filter((p) => p.id !== providerId);
    setProviders(newProviders);
    saveProvidersToStorage(newProviders);

    // Clear selection if removed provider was selected
    if (selectedProvider?.id === providerId) {
      setSelectedProviderState(null);
      setSelectedModel(null);
      setAvailableModels([]);
    }
  };

  const updateProvider = (providerId: string, updates: Partial<Provider>) => {
    const newProviders = providers.map((p) =>
      p.id === providerId ? { ...p, ...updates } : p,
    );
    setProviders(newProviders);
    saveProvidersToStorage(newProviders);

    // Update selected provider if it was modified
    if (selectedProvider?.id === providerId) {
      const updated = newProviders.find((p) => p.id === providerId);
      if (updated) setSelectedProviderState(updated);
    }
  };

  const selectProvider = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (provider) {
      setSelectedProviderState(provider);
      setSelectedModel(null); // Clear model selection when switching providers
      setAvailableModels([]); // Clear available models
    }
  };

  const selectModel = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  const discoverModels = async (
    providerId: string,
  ): Promise<ModelDiscoveryResult> => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) {
      return { models: [], error: "Provider not found" };
    }

    try {
      // Try different model endpoint formats
      const endpoints = [
        `${provider.baseUrl}/v1/models`, // OpenAI-style
        `${provider.baseUrl}/models`, // Z.ai and others
      ];

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            headers: {
              Authorization:
                provider.authType === "bearer"
                  ? `Bearer ${provider.apiKey}`
                  : `Bearer ${provider.apiKey}`, // Default to Bearer for now
              "Content-Type": "application/json",
              ...provider.customHeaders,
            },
          });

          if (response.ok) break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!response || !response.ok) {
        const errorMsg = response
          ? `HTTP ${response.status}: ${response.statusText}`
          : lastError?.message || "Failed to reach models endpoint";
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Handle different response formats
      let modelsData: unknown[] = [];
      if (data.data && Array.isArray(data.data)) {
        // OpenAI-style response
        modelsData = data.data;
      } else if (Array.isArray(data)) {
        // Direct array response
        modelsData = data;
      } else if (data.models && Array.isArray(data.models)) {
        // Alternative format
        modelsData = data.models;
      }

      const models: Model[] = modelsData.map((modelData: unknown) => {
        id: modelObj.id || modelObj.name || modelObj.model,
        name: modelObj.id || modelObj.name || modelObj.model,
        providerId,
        contextLength: modelObj.context_length || modelObj.max_context_length,
        supportsStreaming: modelObj.supports_streaming !== false, // Default to true
        supportsVision:
          modelObj.id?.includes("vision") ||
          modelObj.capabilities?.includes("vision") ||
          false,
        supportsFunctionCalling:
          modelObj.id?.includes("tool") ||
          modelObj.capabilities?.includes("tools") ||
          false,
        capabilities: ["text"], // Basic capability
      } as Model

      setAvailableModels(models);
      return { models };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to discover models";
      return { models: [], error };
    }
  };

  const testConnection = async (
    providerId: string,
    modelId?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    try {
      const testPayload = {
        model: modelId || "glm-4.6", // Use Z.ai default model for testing
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      };

      // Try different chat completion endpoint formats
      const endpoints = [
        `${provider.baseUrl}/v1/chat/completions`, // OpenAI-style
        `${provider.baseUrl}/chat/completions`, // Z.ai and others
      ];

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization:
                provider.authType === "bearer"
                  ? `Bearer ${provider.apiKey}`
                  : `Bearer ${provider.apiKey}`,
              "Content-Type": "application/json",
              ...provider.customHeaders,
            },
            body: JSON.stringify(testPayload),
          });

          if (response.ok) break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!response || !response.ok) {
        const errorMsg = response
          ? `HTTP ${response.status}: ${response.statusText}`
          : lastError?.message || "Failed to reach chat completions endpoint";
        throw new Error(errorMsg);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Connection test failed",
      };
    }
  };

  const value = {
    client,
    isConnected,
    isLoading,
    error,
    providers,
    selectedProvider,
    selectedModel,
    availableModels,
    connect,
    disconnect,
    addProvider,
    removeProvider,
    updateProvider,
    selectProvider,
    selectModel,
    discoverModels,
    testConnection,
  };

  return (
    <OpenCodeContext.Provider value={value}>
      {children}
    </OpenCodeContext.Provider>
  );
}

export function useOpenCode() {
  const context = useContext(OpenCodeContext);
  if (context === undefined) {
    throw new Error("useOpenCode must be used within an OpenCodeProvider");
  }
  return context;
}
