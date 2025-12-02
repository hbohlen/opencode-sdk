import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { createOpencodeClient } from "@opencode-ai/sdk";

interface OpenCodeContextType {
  client: ReturnType<typeof createOpencodeClient> | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const OpenCodeContext = createContext<OpenCodeContextType | undefined>(
  undefined,
);

interface OpenCodeProviderProps {
  children: ReactNode;
}

export function OpenCodeProvider({ children }: OpenCodeProviderProps) {
  const client = null; // TODO: Initialize OpenCode SDK client
  const isConnected = false;
  const isLoading = false;
  const error = null;

  const value = {
    client,
    isConnected,
    isLoading,
    error,
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
