# Change: Create Backend API Server

## Why

Several proposals are blocked because they require a backend server:
- **add-valkey-caching**: Redis/Valkey client cannot run in browser
- **add-zep-graphiti-memory-layer**: GraphitiClient needs server-side API keys
- **add-observability-stack**: Metrics and logging need server-side collection
- **add-falkordb-podman-integration**: Graph database client needs server
- **add-custom-model-management**: Secure API key storage needs encryption server-side

Currently, the web-ui is a purely client-side React application. This limits what can be done safely and effectively.

A backend API server will:
1. Securely store and use API keys (never exposed to browser)
2. Act as a proxy for LLM provider requests
3. Host services that require server-side execution
4. Enable caching, rate limiting, and observability
5. Provide session management

## What Changes

### API Server Setup
- Create Express.js/Fastify API server in `api/` directory
- Configure TypeScript and ES modules
- Set up development and production modes
- Add Docker/container configuration

### Core API Endpoints
- `/api/v1/providers` - Provider management
- `/api/v1/chat` - Chat completions proxy
- `/api/v1/models` - Model discovery
- `/api/v1/health` - Health check

### Security
- Integrate 1Password CLI/SDK for secrets management (see `integrate-1password-secrets` proposal)
- Store secret references instead of encrypted keys
- Add CORS configuration for web-ui
- Implement rate limiting
- Add request validation

### Integration
- Update web-ui to call API server instead of direct provider calls
- Configure environment variables for API URL
- Add WebSocket support for streaming

## Impact

- New directory: `api/`
- New dependencies: express/fastify, cors, helmet, etc.
- Modified: web-ui environment configuration
- **UNBLOCKS**: Valkey, Graphiti, FalkorDB, Observability proposals

## Migration Strategy

1. Create API server with basic endpoints
2. Add proxy endpoint for LLM providers
3. Move sensitive operations from client to server
4. Update web-ui to use API endpoints
5. Deprecate direct provider calls from browser

## Security Considerations

- API keys managed via 1Password Service Accounts (see `integrate-1password-secrets`)
- Secret references stored instead of actual keys
- CORS configured for known origins only
- Rate limiting to prevent abuse
- Input validation on all endpoints
- HTTPS required in production
