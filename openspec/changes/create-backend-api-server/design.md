# Design: Backend API Server

## Context

The web-ui currently makes direct API calls to LLM providers from the browser. This approach has limitations:
- API keys are exposed in browser network traffic
- Cannot use server-side libraries (Redis, databases)
- No centralized rate limiting or caching
- CORS issues with some providers

## Goals / Non-Goals

### Goals
- Create secure API proxy for LLM providers
- Implement provider/model management endpoints
- Support streaming responses
- Enable server-side storage of sensitive data
- Provide foundation for future services (caching, observability)

### Non-Goals
- Full user authentication system (defer)
- Database integration (use file storage initially)
- Microservices architecture (monolith is fine)
- GraphQL API (REST is sufficient)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Web-UI (React)                       │ │
│  │                                                         │ │
│  │  - No API keys stored                                   │ │
│  │  - Calls API server for all provider operations         │ │
│  │  - Receives streamed responses via SSE                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Server (Node.js)                      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │  │ Middleware │  │  Services  │            │
│  │            │  │            │  │            │            │
│  │ /providers │  │ CORS       │  │ Provider   │            │
│  │ /chat      │  │ RateLimit  │  │ Storage    │            │
│  │ /models    │  │ Validation │  │ Encryption │            │
│  │ /health    │  │ Logging    │  │ HttpClient │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Provider Proxy                         │ │
│  │  - Routes requests to correct provider                  │ │
│  │  - Transforms request/response formats                  │ │
│  │  - Handles streaming                                    │ │
│  │  - Injects decrypted API keys                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LLM Providers                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ OpenAI  │  │ Z.ai    │  │ Anthropic│  │ Custom  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
api/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── config/
│   │   └── index.ts             # Configuration loader
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── health.ts            # Health check routes
│   │   ├── providers.ts         # Provider CRUD routes
│   │   ├── chat.ts              # Chat completions proxy
│   │   └── models.ts            # Model discovery routes
│   ├── middleware/
│   │   ├── cors.ts              # CORS configuration
│   │   ├── rateLimit.ts         # Rate limiting
│   │   ├── validation.ts        # Request validation
│   │   ├── errorHandler.ts      # Error handling
│   │   └── logging.ts           # Request logging
│   ├── services/
│   │   ├── providerService.ts   # Provider management
│   │   ├── storageService.ts    # File-based storage
│   │   ├── encryptionService.ts # API key encryption
│   │   ├── proxyService.ts      # LLM request proxy
│   │   └── modelService.ts      # Model discovery
│   ├── types/
│   │   ├── provider.ts          # Provider types
│   │   ├── chat.ts              # Chat types
│   │   └── api.ts               # API request/response types
│   └── utils/
│       ├── errors.ts            # Custom error classes
│       ├── logger.ts            # Logging utility
│       └── stream.ts            # Streaming utilities
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Health Check

```
GET /api/v1/health
Response: { status: "ok", timestamp: "...", version: "1.0.0" }
```

### Providers

```
GET    /api/v1/providers              # List all providers
POST   /api/v1/providers              # Create provider
GET    /api/v1/providers/:id          # Get provider by ID
PUT    /api/v1/providers/:id          # Update provider
DELETE /api/v1/providers/:id          # Delete provider
GET    /api/v1/providers/:id/health   # Check provider health
POST   /api/v1/providers/:id/test     # Test provider connection
```

### Models

```
GET    /api/v1/providers/:id/models   # List models for provider
POST   /api/v1/providers/:id/models/refresh  # Refresh model cache
```

### Chat

```
POST   /api/v1/chat/completions       # Proxy chat completion
Body: {
  provider_id: string,
  model: string,
  messages: [...],
  stream: boolean
}
Response: SSE stream or JSON completion
```

## Security Design

### API Key Encryption

```typescript
// Use AES-256-GCM for encrypting API keys at rest
interface EncryptedData {
  iv: string;      // Initialization vector
  data: string;    // Encrypted data
  tag: string;     // Authentication tag
}

// Encryption key MUST be derived using PBKDF2 from the environment variable
// Never use the environment variable directly as the encryption key
const ENCRYPTION_KEY_SOURCE = process.env.PROVIDER_ENCRYPTION_KEY;

// Key derivation (in service initialization)
async function deriveEncryptionKey(source: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(source, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

// Store salt securely (e.g., in a separate config file)
// The derived key is used for encryption, not the raw env var

// Never log or expose decrypted keys
function encryptApiKey(plaintext: string, derivedKey: Buffer): EncryptedData;
function decryptApiKey(encrypted: EncryptedData, derivedKey: Buffer): string;
```

### Request Flow with Security

1. Web-UI sends request to API server (no API key in request)
2. API server validates request
3. API server looks up provider by ID
4. API server decrypts provider's API key (in memory only)
5. API server makes request to provider with decrypted key
6. Response streamed back to web-UI
7. Decrypted key discarded (not cached)

### CORS Configuration

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
```

## Streaming Design

### Server-Sent Events for Chat

```typescript
// Route handler for streaming chat
app.post('/api/v1/chat/completions', async (req, res) => {
  if (req.body.stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const providerStream = await proxyService.streamChat(req.body);
    
    for await (const chunk of providerStream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    const response = await proxyService.chat(req.body);
    res.json(response);
  }
});
```

### Client-Side SSE Handling

```typescript
// Web-UI API client for streaming
async function* streamChat(params: ChatParams): AsyncGenerator<ChatChunk> {
  const response = await fetch(`${API_URL}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, stream: true }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        yield JSON.parse(data);
      }
    }
  }
}
```

## Provider Storage

### File-Based Storage (Initial Implementation)

```typescript
// Store providers in JSON file
const PROVIDERS_FILE = process.env.PROVIDERS_FILE || './data/providers.json';

interface StoredProvider {
  id: string;
  name: string;
  baseUrl: string;
  encryptedApiKey: EncryptedData;
  routingMethod: string;
  customHeaders?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Storage service interface (can swap to database later)
interface IProviderStorage {
  list(): Promise<StoredProvider[]>;
  get(id: string): Promise<StoredProvider | null>;
  create(provider: CreateProviderInput): Promise<StoredProvider>;
  update(id: string, updates: UpdateProviderInput): Promise<StoredProvider>;
  delete(id: string): Promise<void>;
}
```

## Error Handling

### Custom Error Classes

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ProviderError extends ApiError {
  constructor(message: string, public providerId: string, details?: any) {
    super(502, 'PROVIDER_ERROR', message, details);
    this.name = 'ProviderError';
  }
}

class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid provider configuration",
    "details": {
      "field": "baseUrl",
      "issue": "Must be a valid URL"
    }
  }
}
```

## Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000
HOST=localhost

# Security
PROVIDER_ENCRYPTION_KEY=your-256-bit-key-here
ALLOWED_ORIGINS=http://localhost:5173

# Storage
PROVIDERS_FILE=./data/providers.json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Risks / Trade-offs

### Risk: Single Point of Failure
- **Mitigation**: Health checks, graceful degradation, retry logic in client

### Risk: Added Latency
- **Mitigation**: Keep server co-located, minimal processing

### Trade-off: Complexity vs Security
- **Accept**: Increased complexity for significantly better security

### Trade-off: File Storage vs Database
- **Accept**: File storage initially, migrate to database when needed

## Open Questions

1. Express vs Fastify?
   - Express: More familiar, larger ecosystem
   - Fastify: Better performance, built-in schema validation
   - **Suggestion**: Start with Express for familiarity

2. How to handle API key migration?
   - Users will need to re-enter API keys (stored encrypted on server)
   - **TODO**: Design migration workflow

3. WebSocket vs SSE for streaming?
   - SSE: Simpler, sufficient for chat
   - WebSocket: More flexible, needed for bidirectional
   - **Suggestion**: Start with SSE, add WebSocket if needed
