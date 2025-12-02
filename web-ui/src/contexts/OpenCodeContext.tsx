import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { createOpencodeClient } from "@opencode-ai/sdk/client";

interface OpenCodeContextType {
  client: ReturnType<typeof createOpencodeClient> | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: (apiKey: string, endpoint?: string) => Promise<void>;
  disconnect: () => void;
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

  const value = {
    client,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
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
