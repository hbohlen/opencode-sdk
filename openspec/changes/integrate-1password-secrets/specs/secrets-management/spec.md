# Secrets Management Spec

## ADDED Requirements

### Requirement: 1Password CLI Integration
The system SHALL support retrieving secrets from 1Password using the CLI and Service Accounts.

#### Scenario: Secret Retrieval via CLI
Given a configured 1Password service account
When the system needs an API key for a provider
Then it retrieves the secret using `op read` command

#### Scenario: Service Account Authentication
Given the OP_SERVICE_ACCOUNT_TOKEN environment variable is set
When the API server starts
Then it authenticates with 1Password using the service account

### Requirement: Secret Reference Storage
The system SHALL store secret references (not actual secrets) in provider configurations.

#### Scenario: Provider with Secret Reference
Given a provider configuration with apiKeyRef "op://vault/item/field"
When the provider's API key is needed
Then the reference is resolved to the actual secret value

### Requirement: Secret Caching
The system SHALL cache resolved secrets with configurable TTL.

#### Scenario: Cached Secret Retrieval
Given a previously resolved secret within TTL
When the same secret is requested
Then the cached value is returned without calling 1Password

#### Scenario: Cache Expiration
Given a cached secret past its TTL
When the secret is requested
Then a fresh value is retrieved from 1Password

### Requirement: Local Development Fallback
The system SHALL support environment variable fallback when 1Password is not available.

#### Scenario: Development Mode
Given no OP_SERVICE_ACCOUNT_TOKEN is set
When a secret reference is resolved
Then it falls back to environment variables

### Requirement: 1Password SDK Integration (Optional)
The system MAY support the 1Password SDK for programmatic access.

#### Scenario: SDK Initialization
Given @1password/sdk is installed
When the SDK adapter is configured
Then secrets can be resolved via SDK API

## MODIFIED Requirements

### Requirement: Secure API Key Storage
API keys SHALL be stored as 1Password secret references instead of encrypted values.

#### Scenario: Provider Creation
Given a user creates a new provider
When they enter the API key
Then the key is stored in 1Password and a reference is saved

## REMOVED Requirements

### Requirement: Custom Encryption Service
The PBKDF2-derived AES-256-GCM encryption service is REMOVED in favor of 1Password.

#### Reason
1Password provides enterprise-grade security without custom implementation.
