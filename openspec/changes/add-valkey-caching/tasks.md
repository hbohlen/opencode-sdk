# Tasks: Add Valkey for Redis-Compatible Caching

## BLOCKERS

This proposal requires infrastructure that is not currently implemented:

1. **Container Runtime Required**: Valkey requires Podman/Docker for container deployment
2. **Backend Server Required**: Caching services need a backend API server to host the ValkeyClient
3. **No Current Session Management**: Web-ui is client-only with no server-side session handling
4. **Rate Limiting Needs Backend**: Rate limiting must be implemented server-side, not client-side

## Prerequisites Not Met

- [ ] Podman/Docker container runtime
- [ ] Backend API server implementation
- [ ] Node.js 18+ for ioredis client
- [ ] Minimum 256MB RAM for Valkey container

---

## 1. Infrastructure Setup

- [ ] 1.1 Add Valkey container to Podman Pod configuration
  - **BLOCKER**: No Podman/Docker infrastructure exists
- [ ] 1.2 Configure persistent volume for Valkey data
- [ ] 1.3 Set up Valkey configuration file (valkey.conf)
- [ ] 1.4 Add health checks for Valkey container
- [ ] 1.5 Configure memory limits and eviction policies
- [ ] 1.6 Update Podman Compose for development

## 2. Valkey Client Integration

- [ ] 2.1 Add ioredis npm package dependency
  - **BLOCKER**: Requires backend server for Redis client
  - **NOTE**: ioredis cannot run in browser environments
- [ ] 2.2 Create ValkeyClient service class
  - See design.md for implementation pattern
- [ ] 2.3 Implement connection pooling and reconnection logic
- [ ] 2.4 Add error handling and circuit breaker pattern
- [ ] 2.5 Create TypeScript types for cache operations

## 3. Caching Service Layer

- [ ] 3.1 Create CacheService abstraction
  - **BLOCKER**: Requires ValkeyClient (needs backend)
- [ ] 3.2 Implement key namespacing and generation
- [ ] 3.3 Add TTL management for different cache types
- [ ] 3.4 Create cache invalidation utilities
- [ ] 3.5 Implement cache warming strategies

## 4. Response Caching

- [ ] 4.1 Create LLM response caching middleware
  - **BLOCKER**: Requires backend API with LLM proxy
- [ ] 4.2 Implement prompt hashing for cache keys
- [ ] 4.3 Add cache-aside pattern for API responses
- [ ] 4.4 Handle streaming response caching
  - **TODO**: Design decision needed for streaming cache strategy
- [ ] 4.5 Implement cache hit/miss metrics

## 5. Session Management

- [ ] 5.1 Create SessionManager service
  - **BLOCKER**: Requires backend server for session storage
- [ ] 5.2 Implement conversation session storage
- [ ] 5.3 Add session expiration and cleanup
- [ ] 5.4 Handle session serialization/deserialization
- [ ] 5.5 Create session recovery mechanisms

## 6. Rate Limiting

- [ ] 6.1 Create RateLimiter service
  - **BLOCKER**: Requires backend server for rate limiting
  - **SECURITY**: Rate limiting in browser can be bypassed
- [ ] 6.2 Implement sliding window rate limiting
- [ ] 6.3 Add per-user and per-provider limits
- [ ] 6.4 Create rate limit exceeded handling
- [ ] 6.5 Add rate limit headers to responses

## 7. Web UI Integration

- [ ] 7.1 Add cache context to OpenCodeContext
  - **BLOCKER**: Requires backend API to proxy cache operations
- [ ] 7.2 Implement cache status indicators
- [ ] 7.3 Add cache management UI (optional)
- [ ] 7.4 Create cache bypass options for debugging

## 8. Testing & Validation

- [ ] 8.1 Create unit tests for ValkeyClient
  - **BLOCKER**: No test framework configured
- [ ] 8.2 Add integration tests for caching operations
- [ ] 8.3 Test cache invalidation scenarios
- [ ] 8.4 Performance benchmarking with/without cache
- [ ] 8.5 Test failover and reconnection logic

## 9. Documentation

- [ ] 9.1 Document Valkey setup and configuration
- [ ] 9.2 Create caching strategy documentation
- [ ] 9.3 Write API documentation for cache services
- [ ] 9.4 Add troubleshooting guide
- [ ] 9.5 Create cache tuning guidelines

## Dependencies

- Task 1 must complete before Tasks 2-6 (infrastructure required)
- Task 2 must complete before Tasks 3-6 (client required)
- Tasks 3-6 can run in parallel after Task 2
- Task 7 depends on Tasks 3-5 (services required for UI)
- Task 8 depends on Tasks 1-7 (all components needed)
- Task 9 can start after Task 1 and continue throughout

## Next Steps to Unblock

1. **Create Backend Server**: Implement Node.js/Express backend to host ValkeyClient
2. **Set Up Container Infrastructure**: Configure Podman/Docker for Valkey deployment
3. **Add Test Framework**: Configure testing for cache services
4. **Design Cache Strategy**: Decide on TTL values, eviction policies, and cache key patterns
