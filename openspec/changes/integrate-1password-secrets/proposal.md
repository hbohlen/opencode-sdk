# Change: Integrate 1Password for Secrets Management

## Why

The current proposal for storing API keys uses custom PBKDF2-derived AES-256-GCM encryption. While secure, this approach:
- Requires managing encryption keys manually
- Needs custom implementation and maintenance
- Lacks enterprise-grade audit trails
- Doesn't integrate with existing secrets management workflows

Using 1Password with Service Accounts provides:
- Enterprise-grade secrets management
- Built-in audit logging
- Team sharing capabilities
- Native integration via CLI and SDK
- No need to manage encryption keys manually

## What Changes

### 1Password CLI Integration
- Use `op` CLI for secrets retrieval via service accounts
- Environment variable injection for provider API keys
- Secure secret references instead of stored keys

### 1Password SDK Integration (Optional)
- Integrate `@1password/sdk` for programmatic access
- Direct secret retrieval from Node.js backend
- Watch for secret changes and hot-reload

### Backend API Updates
- Remove custom encryption service
- Add 1Password secret resolution
- Support both CLI and SDK approaches
- Maintain fallback for local development

## Impact

- Modified: `create-backend-api-server` proposal (security section)
- New dependency: `@1password/sdk` (optional)
- Requires: 1Password Service Account setup
- **SIMPLIFIES**: No custom encryption code needed

## Prerequisites

- 1Password account with Service Account feature
- Service account token configured
- 1Password CLI (`op`) installed on server

## Security Considerations

- Service account tokens stored securely (not in code)
- Minimal permissions for service account
- Audit trail for all secret access
- Secret rotation handled by 1Password
