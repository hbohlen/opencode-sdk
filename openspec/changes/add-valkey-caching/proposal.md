# Change: Add Valkey for Redis-Compatible Caching

## Why

The opencode-sdk and web-ui need a high-performance caching layer to optimize response times, reduce API calls to LLM providers, and improve overall system performance. Valkey is an open-source, Redis-compatible key-value store that provides:

1. Low-latency caching for frequently accessed data
2. Session management for user conversations
3. Rate limiting and request throttling
4. Pub/Sub messaging for real-time features
5. Temporary storage for streaming responses

Valkey is a community-driven fork of Redis, offering full Redis protocol compatibility while being truly open source under BSD-3-Clause license.

## What Changes

### Core Valkey Integration

- Add Valkey container to the Podman Pod configuration
- Implement Valkey client using ioredis for Node.js/TypeScript
- Create caching abstraction layer with TTL management
- Configure persistent storage for cache durability
- Set up cluster-ready configuration for production scaling

### Caching Strategies

- **Response Caching**: Cache LLM responses for identical prompts
- **Context Caching**: Store preprocessed context windows
- **Session Caching**: Manage active user sessions and state
- **Model Metadata Caching**: Cache provider/model configurations
- **Rate Limit Tracking**: Track API usage per user/provider

### Cache Key Design

- Implement consistent key namespacing
- Add key expiration policies per cache type
- Create cache invalidation strategies
- Support cache warming for common queries

### Integration Points

- Cache layer between web-ui and LLM providers
- Session store for conversation management
- Pub/Sub for real-time streaming updates
- Queue system for background processing

**BREAKING**: None - caching is an additive optimization layer

## Impact

- Affected specs: infrastructure (Valkey container), web-ui (cache integration)
- Affected code: API handlers, context providers, new cache client modules
- New components: ValkeyClient, CacheService, SessionManager, RateLimiter
- New dependencies: ioredis (Node.js client), Valkey container image
- Infrastructure: Valkey container added to Podman Pod

## Prerequisites

- Podman Pod infrastructure (from FalkorDB proposal or standalone)
- Node.js 18+ for ioredis client
- Minimum 256MB RAM for Valkey container

## Relationship to Other Proposals

- **FalkorDB**: Valkey handles ephemeral caching; FalkorDB handles persistent graph data
- **Zep Graphiti**: Valkey caches memory query results for faster retrieval
- **Observability**: Valkey metrics exported to monitoring stack
