// Configuration options for OpenCode initialization
export interface OpenCodeConfig {
  gatewayEndpoint?: string;
  healthCheckInterval?: number;
  timeout?: number;
  maxConsecutiveFailures?: number;
  retryDelay?: number;
}

// Session manager placeholder interface - methods to be added as needed
export type SessionManager = Record<string, never>;

// API request interface for chat completions
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

// API response interface for chat completions
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
}

// Model data from API responses
export interface ModelData {
  id: string;
  name?: string;
  description?: string;
  context_window?: number;
  contextLength?: number;
  max_output_tokens?: number;
  max_tokens?: number;
  vision?: boolean;
  audio?: boolean;
  function_calling?: boolean;
  functions?: boolean;
  reasoning?: boolean;
  coding?: boolean;
}

// Model discovery response types
export interface ModelListResponse {
  data?: ModelData[];
  object?: string;
}
