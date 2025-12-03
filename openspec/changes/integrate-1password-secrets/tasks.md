# Tasks: Integrate 1Password for Secrets Management

## Phase 1: 1Password CLI Integration

### 1.1 Setup and Configuration

- [ ] 1.1.1 Document 1Password Service Account setup requirements
- [ ] 1.1.2 Create configuration for 1Password vault and item paths
- [ ] 1.1.3 Add environment variable for service account token (`OP_SERVICE_ACCOUNT_TOKEN`)
- [ ] 1.1.4 Create startup script to validate 1Password CLI availability

### 1.2 Secret Resolution Service

- [ ] 1.2.1 Create `OnePasswordService` interface
- [ ] 1.2.2 Implement CLI-based secret retrieval using `op read`
- [ ] 1.2.3 Add caching layer for resolved secrets (configurable TTL)
- [ ] 1.2.4 Implement error handling for CLI failures
- [ ] 1.2.5 Add health check for 1Password connectivity

### 1.3 Provider Integration

- [ ] 1.3.1 Update provider storage to use secret references (e.g., `op://vault/item/field`)
- [ ] 1.3.2 Resolve API keys at runtime via 1Password
- [ ] 1.3.3 Support fallback to environment variables for local dev
- [ ] 1.3.4 Add provider API endpoint for secret reference validation

## Phase 2: 1Password SDK Integration (Optional)

### 2.1 SDK Setup

- [ ] 2.1.1 Add `@1password/sdk` dependency
- [ ] 2.1.2 Create SDK client wrapper with proper initialization
- [ ] 2.1.3 Implement secret retrieval via SDK
- [ ] 2.1.4 Add connection pooling and retry logic

### 2.2 Advanced Features

- [ ] 2.2.1 Implement secret change watching (if SDK supports)
- [ ] 2.2.2 Add automatic secret rotation handling
- [ ] 2.2.3 Create admin endpoint for secret status

## Phase 3: Update Backend API Server Proposal

### 3.1 Remove Custom Encryption

- [ ] 3.1.1 Update `create-backend-api-server` design.md to use 1Password
- [ ] 3.1.2 Remove `encryptionService.ts` from design
- [ ] 3.1.3 Add `onePasswordService.ts` to design
- [ ] 3.1.4 Update environment variables documentation

### 3.2 Documentation

- [ ] 3.2.1 Create 1Password setup guide
- [ ] 3.2.2 Document vault structure recommendations
- [ ] 3.2.3 Add troubleshooting guide for common issues
- [ ] 3.2.4 Document local development fallback options

## Validation

- [ ] 1Password CLI integration works with service account
- [ ] Secrets are retrieved correctly at runtime
- [ ] No plaintext secrets in storage or logs
- [ ] Fallback works for local development
- [ ] Health checks verify 1Password connectivity

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 3 can run in parallel with Phase 1

## Notes

- CLI approach is simpler and works without SDK dependency
- SDK provides more features but adds dependency
- Recommend starting with CLI, adding SDK if advanced features needed
