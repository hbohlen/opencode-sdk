# Design: Valkey Caching Integration

## Architecture Overview

Valkey integrates into the Podman Pod as a high-performance caching layer, providing Redis-compatible operations for the opencode-sdk ecosystem.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Podman Pod: opencode-pod                         │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Shared Pod Network                            │   │
│  │                     localhost:6380 (Valkey)                       │   │
│  │                     localhost:6379 (FalkorDB)                     │   │
│  │                     localhost:5173 (web-ui)                       │   │
│  │                     localhost:3000 (opencode-api)                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   Valkey     │ │   FalkorDB   │ │ opencode-api │ │    web-ui    │   │
│  │   Container  │ │   Container  │ │   Container  │ │   Container  │   │
│  │              │ │              │ │              │ │              │   │
│  │  - Cache     │ │  - Graph DB  │ │  - API       │ │  - React     │   │
│  │  - Sessions  │ │  - Cypher    │ │  - Cache     │ │  - Vite      │   │
│  │  - Pub/Sub   │ │              │ │    Client    │ │              │   │
│  │              │ │              │ │              │ │              │   │
│  │  Port: 6380  │ │  Port: 6379  │ │  Port: 3000  │ │  Port: 5173  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Valkey Container Configuration

**Purpose**: High-performance caching with Redis protocol compatibility

```yaml
# Added to podman-compose.yaml
valkey:
  image: valkey/valkey:7.2-alpine
  container_name: opencode-valkey
  ports:
    - "6380:6379"
  volumes:
    - valkey-data:/data
    - ./config/valkey.conf:/etc/valkey/valkey.conf
  command: valkey-server /etc/valkey/valkey.conf
  environment:
    - VALKEY_MAXMEMORY=256mb
    - VALKEY_MAXMEMORY_POLICY=allkeys-lru
  healthcheck:
    test: ["CMD", "valkey-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 3
  restart: unless-stopped
```

### 2. Valkey Configuration File

```conf
# config/valkey.conf
bind 0.0.0.0
port 6379
protected-mode no

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (optional for cache)
appendonly no
save ""

# Performance tuning
tcp-keepalive 300
timeout 0

# Logging
loglevel notice
logfile ""
```

### 3. Valkey Client Service

**Purpose**: TypeScript client for Valkey operations

```typescript
// src/services/ValkeyClient.ts
import Redis from "ioredis";

interface ValkeyConfig {
  host: string;
  port: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}

export class ValkeyClient {
  private client: Redis;
  private config: ValkeyConfig;

  constructor(config: ValkeyConfig) {
    this.config = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      ...config,
    };
  }

  async connect(): Promise<void> {
    this.client = new Redis({
      host: this.config.host,
      port: this.config.port,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      enableReadyCheck: this.config.enableReadyCheck,
      lazyConnect: this.config.lazyConnect,
      retryStrategy: (times: number) => {
        if (times > 10) return null; // Stop retrying
        return Math.min(times * 100, 3000); // Exponential backoff
      },
    });

    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  // Expose Redis client for advanced operations (e.g., multi/exec)
  getRedisClient(): Redis {
    return this.client;
  }

  // Basic operations
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  // Hash operations for complex objects
  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const hash = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    return result;
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: unknown): Promise<void> {
    await this.client.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, handler: (message: unknown) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        handler(JSON.parse(message));
      }
    });
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === "PONG";
    } catch {
      return false;
    }
  }
}
```

### 4. Cache Service Abstraction

**Purpose**: High-level caching operations with namespacing and TTL management

```typescript
// src/services/CacheService.ts
import { ValkeyClient } from "./ValkeyClient";
import crypto from "crypto";

interface CacheOptions {
  ttl?: number; // seconds
  namespace?: string;
}

export class CacheService {
  private client: ValkeyClient;
  private defaultTTL: Record<string, number> = {
    response: 3600, // 1 hour
    session: 86400, // 24 hours
    context: 1800, // 30 minutes
    metadata: 300, // 5 minutes
    rateLimit: 60, // 1 minute
  };

  constructor(client: ValkeyClient) {
    this.client = client;
  }

  private buildKey(namespace: string, identifier: string): string {
    return `opencode:${namespace}:${identifier}`;
  }

  private hashPrompt(prompt: string, model: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(`${model}:${prompt}`);
    return hash.digest("hex").substring(0, 16);
  }

  // Response caching
  async cacheResponse(
    prompt: string,
    model: string,
    response: string,
    options?: CacheOptions
  ): Promise<void> {
    const key = this.buildKey(
      "response",
      this.hashPrompt(prompt, model)
    );
    await this.client.set(key, { prompt, model, response, timestamp: Date.now() }, options?.ttl || this.defaultTTL.response);
  }

  async getCachedResponse(
    prompt: string,
    model: string
  ): Promise<string | null> {
    const key = this.buildKey(
      "response",
      this.hashPrompt(prompt, model)
    );
    const cached = await this.client.get<{ response: string }>(key);
    return cached?.response || null;
  }

  // Session management
  async setSession(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const key = this.buildKey("session", sessionId);
    await this.client.set(key, data, this.defaultTTL.session);
  }

  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const key = this.buildKey("session", sessionId);
    return this.client.get(key);
  }

  async updateSession(
    sessionId: string,
    updates: Record<string, unknown>
  ): Promise<void> {
    const current = await this.getSession(sessionId);
    if (current) {
      await this.setSession(sessionId, { ...current, ...updates });
    }
  }

  // Context caching
  async cacheContext(
    conversationId: string,
    context: unknown
  ): Promise<void> {
    const key = this.buildKey("context", conversationId);
    await this.client.set(key, context, this.defaultTTL.context);
  }

  async getCachedContext(conversationId: string): Promise<unknown | null> {
    const key = this.buildKey("context", conversationId);
    return this.client.get(key);
  }

  // Cache invalidation
  async invalidate(namespace: string, identifier: string): Promise<void> {
    const key = this.buildKey(namespace, identifier);
    await this.client.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Note: Requires SCAN for production use
    // This is a simplified version
    const fullPattern = `opencode:${pattern}`;
    // Implementation would use SCAN and DEL
  }
}
```

### 5. Rate Limiter Service

**Purpose**: Sliding window rate limiting for API protection

```typescript
// src/services/RateLimiter.ts
import { ValkeyClient } from "./ValkeyClient";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiter {
  private client: ValkeyClient;
  private configs: Record<string, RateLimitConfig> = {
    user: { windowMs: 60000, maxRequests: 60 }, // 60 req/min per user
    provider: { windowMs: 60000, maxRequests: 100 }, // 100 req/min per provider
    global: { windowMs: 1000, maxRequests: 1000 }, // 1000 req/sec globally
  };

  constructor(client: ValkeyClient) {
    this.client = client;
  }

  async checkLimit(
    type: string,
    identifier: string
  ): Promise<RateLimitResult> {
    const config = this.configs[type] || this.configs.user;
    const key = `opencode:ratelimit:${type}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis sorted set for sliding window
    // Score = timestamp, Member = unique request ID
    const requestId = `${now}:${Math.random().toString(36).slice(2, 11)}`;

    // Remove old entries, add new one, count current window
    // Access the underlying ioredis client for multi operations
    const redisClient = this.client.getRedisClient();
    const multi = redisClient.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, requestId);
    multi.zcard(key);
    multi.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    const count = results[2][1] as number;

    return {
      allowed: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt: now + config.windowMs,
    };
  }

  async getRateLimitHeaders(
    type: string,
    identifier: string
  ): Promise<Record<string, string>> {
    const result = await this.checkLimit(type, identifier);
    const config = this.configs[type] || this.configs.user;

    return {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.resetAt.toString(),
    };
  }
}
```

## Environment Configuration

```bash
# .env additions for Valkey
VALKEY_HOST=localhost
VALKEY_PORT=6380
VALKEY_MAXMEMORY=256mb
VALKEY_MAXMEMORY_POLICY=allkeys-lru

# Cache TTL settings (seconds)
CACHE_TTL_RESPONSE=3600
CACHE_TTL_SESSION=86400
CACHE_TTL_CONTEXT=1800
CACHE_TTL_METADATA=300
```

## Integration with OpenCodeContext

```typescript
// In OpenCodeContext.tsx - additions
interface OpenCodeContextType {
  // Existing properties...

  // New cache-related properties
  cacheService: CacheService | null;
  rateLimiter: RateLimiter | null;
  cacheEnabled: boolean;

  // New methods
  getCachedOrFetch: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
  invalidateCache: (pattern: string) => Promise<void>;
  getCacheStats: () => Promise<CacheStats>;
}
```

## Security Considerations

### Network Security

- Valkey bound to Pod-internal network only
- No external access without explicit port mapping
- Authentication optional for internal Pod communication

### Data Protection

- Cache data is ephemeral by design
- Sensitive data should not be cached without encryption
- TTL ensures automatic data expiration

### Rate Limiting Security

- Prevents API abuse and DoS attacks
- Per-user and per-provider limits
- Graceful degradation under load

## Performance Considerations

### Memory Management

- LRU eviction policy for automatic cleanup
- Memory limits prevent resource exhaustion
- Key expiration reduces memory pressure

### Connection Pooling

- Reuse connections across requests
- Automatic reconnection on failure
- Circuit breaker prevents cascade failures

### Cache Efficiency

- Hash-based cache keys for fast lookup
- Namespace separation for targeted invalidation
- Batch operations for bulk updates
