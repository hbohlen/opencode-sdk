# Tasks: Create Backend API Server

## Phase 1: Project Setup

### 1.1 Initialize API Project

- [ ] 1.1.1 Create `api/` directory
- [ ] 1.1.2 Initialize npm project with `npm init`
- [ ] 1.1.3 Configure TypeScript (tsconfig.json)
- [ ] 1.1.4 Add ESLint configuration
- [ ] 1.1.5 Set up `src/` directory structure

### 1.2 Install Core Dependencies

- [ ] 1.2.1 Add express (or fastify - see Decision below)
  
  **Framework Decision: Express vs Fastify**
  - **Express**: Larger ecosystem, more middleware options, team likely more familiar
  - **Fastify**: 2-3x faster, built-in JSON schema validation, better TypeScript support
  - **Decision Criteria**:
    - If team has Express experience → use Express
    - If performance is critical → use Fastify
    - If using OpenAPI/Swagger → Fastify has better native support
  - **Recommendation**: Start with Express for faster development, can migrate to Fastify later if needed
- [ ] 1.2.2 Add typescript, ts-node-dev
- [ ] 1.2.3 Add @types packages
- [ ] 1.2.4 Add cors, helmet for security
- [ ] 1.2.5 Add zod for validation

### 1.3 Project Scripts

- [ ] 1.3.1 Add `dev` script for development
- [ ] 1.3.2 Add `build` script for production
- [ ] 1.3.3 Add `start` script for production
- [ ] 1.3.4 Add `lint` script

## Phase 2: Core API Structure

### 2.1 Server Setup

- [ ] 2.1.1 Create main server entry point (`src/index.ts`)
- [ ] 2.1.2 Configure Express/Fastify with middleware
- [ ] 2.1.3 Set up error handling middleware
- [ ] 2.1.4 Add request logging
- [ ] 2.1.5 Configure graceful shutdown

### 2.2 Configuration

- [ ] 2.2.1 Create config loader (`src/config/index.ts`)
- [ ] 2.2.2 Support environment variables
- [ ] 2.2.3 Add `.env.example` file
- [ ] 2.2.4 Create config validation with zod
- [ ] 2.2.5 Support different environments (dev, prod)

### 2.3 Route Structure

- [ ] 2.3.1 Create routes directory structure
- [ ] 2.3.2 Set up route versioning (`/api/v1/`)
- [ ] 2.3.3 Create health check endpoint (`/api/v1/health`)
- [ ] 2.3.4 Add OpenAPI/Swagger documentation (optional)

## Phase 3: Provider Management Endpoints

### 3.1 Provider CRUD

- [ ] 3.1.1 Create `POST /api/v1/providers` - Add provider
- [ ] 3.1.2 Create `GET /api/v1/providers` - List providers
- [ ] 3.1.3 Create `GET /api/v1/providers/:id` - Get provider
- [ ] 3.1.4 Create `PUT /api/v1/providers/:id` - Update provider
- [ ] 3.1.5 Create `DELETE /api/v1/providers/:id` - Delete provider

### 3.2 Provider Storage

- [ ] 3.2.1 Create provider storage interface
- [ ] 3.2.2 Implement file-based storage (initial)
- [ ] 3.2.3 Implement API key encryption
- [ ] 3.2.4 Add provider validation
- [ ] 3.2.5 Support provider configuration templates

### 3.3 Provider Health

- [ ] 3.3.1 Create `GET /api/v1/providers/:id/health` - Check health
- [ ] 3.3.2 Create `POST /api/v1/providers/:id/test` - Test connection
- [ ] 3.3.3 Implement background health monitoring

## Phase 4: Chat/LLM Proxy Endpoints

### 4.1 Chat Completions

- [ ] 4.1.1 Create `POST /api/v1/chat/completions` - Chat proxy
- [ ] 4.1.2 Support streaming responses (SSE)
- [ ] 4.1.3 Add provider selection logic
- [ ] 4.1.4 Implement request transformation for different providers
- [ ] 4.1.5 Add response normalization

### 4.2 Model Discovery

- [ ] 4.2.1 Create `GET /api/v1/providers/:id/models` - List models
- [ ] 4.2.2 Add model caching (in-memory initially)
- [ ] 4.2.3 Create `POST /api/v1/providers/:id/models/refresh` - Refresh cache

## Phase 5: Security & Middleware

### 5.1 Authentication (Optional for MVP)

- [ ] 5.1.1 Create API key middleware
- [ ] 5.1.2 Add bearer token support
- [ ] 5.1.3 Implement API key generation

### 5.2 Rate Limiting

- [ ] 5.2.1 Add rate limiting middleware
- [ ] 5.2.2 Configure limits per endpoint
- [ ] 5.2.3 Add rate limit headers to responses

### 5.3 CORS & Security

- [ ] 5.3.1 Configure CORS for web-ui origin
- [ ] 5.3.2 Add helmet security headers
- [ ] 5.3.3 Add request size limits
- [ ] 5.3.4 Implement input sanitization

## Phase 6: Web-UI Integration

### 6.1 Update Web-UI Configuration

- [ ] 6.1.1 Add `VITE_API_URL` environment variable
- [ ] 6.1.2 Create API client module (`src/api/client.ts`)
- [ ] 6.1.3 Create typed API methods

### 6.2 Update Services

- [ ] 6.2.1 Update ModelDiscoveryService to use API
- [ ] 6.2.2 Update ProviderRouter to use API
- [ ] 6.2.3 Update ChatInterface to use API for chat
- [ ] 6.2.4 Handle streaming responses in client

### 6.3 Remove Direct Provider Calls

- [ ] 6.3.1 Identify all direct fetch calls to providers
- [ ] 6.3.2 Replace with API client calls
- [ ] 6.3.3 Remove API keys from client-side storage
- [ ] 6.3.4 Update error handling for API errors

## Phase 7: Containerization

### 7.1 Docker Setup

- [ ] 7.1.1 Create `Dockerfile` for API server
- [ ] 7.1.2 Create `docker-compose.yml` for development
- [ ] 7.1.3 Configure multi-stage build for production
- [ ] 7.1.4 Add health check to container

## Validation

- [ ] API server starts and responds to health check
- [ ] Provider CRUD endpoints work correctly
- [ ] Chat completions proxy works with at least one provider
- [ ] Web-UI can communicate with API
- [ ] API keys are not exposed in browser
- [ ] Build and lint pass

## Dependencies

- Phase 1 must complete before all other phases
- Phases 2-5 can be done incrementally
- Phase 6 depends on Phases 3-4 being functional
- Phase 7 can be done in parallel with Phase 6

## Open Questions

1. Express vs Fastify?
   - **TODO**: Decide based on team familiarity and performance needs
2. Database for provider storage?
   - **Initial**: File-based, defer database decision
3. Authentication required?
   - **Initial**: No auth for local development, add later
