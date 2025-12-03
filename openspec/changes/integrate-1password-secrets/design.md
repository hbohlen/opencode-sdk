# Design: 1Password Secrets Management

## Context

The backend API server needs secure storage for LLM provider API keys. Instead of implementing custom encryption, we use 1Password with Service Accounts for enterprise-grade secrets management.

## Goals / Non-Goals

### Goals
- Integrate 1Password CLI for secrets retrieval
- Support optional SDK integration for advanced features
- Provide secure secret references in provider configuration
- Enable audit trail for secret access
- Support local development without 1Password

### Non-Goals
- Implement custom encryption (replaced by 1Password)
- Support other secrets managers initially (can add later)
- Manage 1Password accounts/vaults (manual setup)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Server (Node.js)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 OnePasswordService                      │ │
│  │                                                         │ │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │ │
│  │  │   CLI Adapter   │    │     SDK Adapter         │   │ │
│  │  │   (op read)     │    │   (@1password/sdk)      │   │ │
│  │  └────────┬────────┘    └───────────┬─────────────┘   │ │
│  │           │                         │                  │ │
│  │           ▼                         ▼                  │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │              Secret Cache (TTL-based)           │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Provider Service                      │ │
│  │  - Stores secret references (op://vault/item/field)    │ │
│  │  - Resolves to actual secrets via OnePasswordService   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ op CLI / SDK API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      1Password Cloud                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Service Account                       ││
│  │  - Limited vault access                                  ││
│  │  - Audit logging                                         ││
│  │  - Token-based authentication                            ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Vault: opencode-secrets                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ││
│  │  │ OpenAI Key  │  │ Anthropic   │  │ Z.ai Key    │     ││
│  │  │             │  │ Key         │  │             │     ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Secret Reference Format

```
op://vault-name/item-name/field-name

Examples:
op://opencode-secrets/openai-provider/api-key
op://opencode-secrets/anthropic-provider/api-key
op://opencode-secrets/zai-provider/api-key
```

## Service Interface

```typescript
interface ISecretsService {
  // Resolve a secret reference to its value
  resolve(reference: string): Promise<string>;
  
  // Check if a reference is valid (without resolving)
  validate(reference: string): Promise<boolean>;
  
  // Check service availability
  healthCheck(): Promise<boolean>;
  
  // Clear cache (for secret rotation)
  clearCache(): void;
}
```

## CLI Adapter Implementation

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class OnePasswordCLIAdapter {
  private cache: Map<string, { value: string; expires: number }>;
  private cacheTTL: number;

  constructor(cacheTTLMs: number = 300000) { // 5 min default
    this.cache = new Map();
    this.cacheTTL = cacheTTLMs;
  }

  async resolve(reference: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(reference);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Validate reference format
    if (!reference.startsWith('op://')) {
      throw new Error('Invalid secret reference format');
    }

    try {
      const { stdout } = await execAsync(`op read "${reference}"`);
      const value = stdout.trim();
      
      // Cache the resolved value
      this.cache.set(reference, {
        value,
        expires: Date.now() + this.cacheTTL,
      });
      
      return value;
    } catch (error) {
      throw new Error(`Failed to resolve secret: ${error.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await execAsync('op --version');
      await execAsync('op whoami');
      return true;
    } catch {
      return false;
    }
  }
}
```

## SDK Adapter Implementation (Optional)

```typescript
import { createClient } from '@1password/sdk';

class OnePasswordSDKAdapter {
  private client: ReturnType<typeof createClient>;
  private cache: Map<string, { value: string; expires: number }>;

  async initialize(): Promise<void> {
    this.client = await createClient({
      auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
      integrationName: 'opencode-sdk',
      integrationVersion: '1.0.0',
    });
  }

  async resolve(reference: string): Promise<string> {
    // Parse reference: op://vault/item/field
    const [, vault, item, field] = reference.match(/op:\/\/([^/]+)\/([^/]+)\/(.+)/) || [];
    
    if (!vault || !item || !field) {
      throw new Error('Invalid secret reference format');
    }

    const secret = await this.client.secrets.resolve(reference);
    return secret;
  }
}
```

## Provider Storage with Secret References

```typescript
interface StoredProvider {
  id: string;
  name: string;
  baseUrl: string;
  // Changed from encryptedApiKey to secret reference
  apiKeyRef: string; // e.g., "op://opencode-secrets/openai/api-key"
  routingMethod: string;
  customHeaders?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Provider service with secret resolution
class ProviderService {
  constructor(
    private storage: IProviderStorage,
    private secrets: ISecretsService,
  ) {}

  async getProviderWithApiKey(id: string): Promise<ProviderWithKey> {
    const provider = await this.storage.get(id);
    if (!provider) throw new NotFoundError('Provider not found');

    // Resolve secret at runtime
    const apiKey = await this.secrets.resolve(provider.apiKeyRef);
    
    return { ...provider, apiKey };
  }
}
```

## Local Development Fallback

```typescript
// Fallback for local development without 1Password
class EnvironmentSecretsAdapter implements ISecretsService {
  async resolve(reference: string): Promise<string> {
    // Convert reference to env var name
    // op://vault/openai-provider/api-key -> OPENAI_PROVIDER_API_KEY
    const envVar = this.referenceToEnvVar(reference);
    const value = process.env[envVar];
    
    if (!value) {
      throw new Error(`Environment variable ${envVar} not set`);
    }
    
    return value;
  }

  private referenceToEnvVar(reference: string): string {
    const [, , item, field] = reference.match(/op:\/\/([^/]+)\/([^/]+)\/(.+)/) || [];
    return `${item}_${field}`.toUpperCase().replace(/-/g, '_');
  }
}

// Factory to choose adapter based on environment
function createSecretsService(): ISecretsService {
  if (process.env.OP_SERVICE_ACCOUNT_TOKEN) {
    return new OnePasswordCLIAdapter();
  }
  return new EnvironmentSecretsAdapter();
}
```

## Environment Variables

```bash
# 1Password Configuration
OP_SERVICE_ACCOUNT_TOKEN=your-service-account-token

# Cache configuration
OP_CACHE_TTL_MS=300000  # 5 minutes

# For local development without 1Password
# OPENAI_PROVIDER_API_KEY=sk-xxx
# ANTHROPIC_PROVIDER_API_KEY=sk-xxx
```

## Vault Structure Recommendation

```
Vault: opencode-secrets
├── openai-provider
│   ├── api-key
│   └── org-id (optional)
├── anthropic-provider
│   └── api-key
├── zai-provider
│   └── api-key
├── gateway-provider
│   └── api-key
└── [custom-provider-name]
    └── api-key
```

## Security Considerations

### Service Account Best Practices
- Use minimal permissions (read-only to specific vault)
- Rotate tokens regularly
- Monitor audit logs for suspicious access
- Use separate service accounts for dev/prod

### Token Security
- Never commit service account token to code
- Use secure injection (K8s secrets, CI/CD secrets)
- Rotate token if compromised

### Audit Trail
- 1Password logs all secret access
- Integrate with SIEM if needed
- Review access patterns periodically

## Risks / Trade-offs

### Risk: 1Password Dependency
- **Mitigation**: Environment variable fallback for local dev

### Risk: Network Latency
- **Mitigation**: Caching with configurable TTL

### Risk: Service Account Token Compromise
- **Mitigation**: Minimal permissions, rotation, monitoring

### Trade-off: External Dependency vs Custom Crypto
- **Accept**: External dependency provides better security guarantees

## Open Questions

1. Should we support other secrets managers (Vault, AWS Secrets)?
   - **Decision**: Start with 1Password, add others if requested

2. How to handle secret rotation?
   - **Decision**: Cache TTL ensures fresh secrets; can add webhook if 1Password supports

3. SDK vs CLI?
   - **Decision**: Start with CLI (simpler), add SDK for advanced features
