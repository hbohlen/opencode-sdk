# API Server Spec

## ADDED Requirements

### Requirement: API Server Runtime
The system SHALL provide a Node.js-based API server for backend operations.

#### Scenario: Server Startup
Given the API server is configured
When the server starts
Then it listens on the configured port and responds to requests

### Requirement: Provider Management API
The system SHALL provide REST API endpoints for provider CRUD operations.

#### Scenario: Create Provider
Given a valid provider configuration
When a POST request is made to /api/v1/providers
Then the provider is created and returned with encrypted API key

#### Scenario: List Providers
Given providers exist in storage
When a GET request is made to /api/v1/providers
Then all providers are returned without decrypted API keys

### Requirement: Chat Completion Proxy
The system SHALL proxy chat completion requests to LLM providers.

#### Scenario: Non-Streaming Chat
Given a valid chat request with stream: false
When a POST request is made to /api/v1/chat/completions
Then the complete response is returned as JSON

#### Scenario: Streaming Chat
Given a valid chat request with stream: true
When a POST request is made to /api/v1/chat/completions
Then the response is streamed as Server-Sent Events

### Requirement: Secure API Key Storage
The system SHALL encrypt API keys at rest using AES-256-GCM.

#### Scenario: API Key Encryption
Given a provider is created with an API key
When the provider is stored
Then the API key is encrypted and the plaintext is not persisted

### Requirement: Model Discovery API
The system SHALL provide endpoints for discovering models from providers.

#### Scenario: Discover Models
Given a valid provider ID
When a GET request is made to /api/v1/providers/:id/models
Then the list of available models is returned

### Requirement: Health Check Endpoint
The system SHALL provide a health check endpoint for monitoring.

#### Scenario: Health Check
Given the API server is running
When a GET request is made to /api/v1/health
Then a healthy status response is returned

## MODIFIED Requirements

### Requirement: Web-UI Provider Integration
The web-ui SHALL use the API server for all provider operations instead of direct calls.

#### Scenario: Web-UI API Usage
Given the web-ui is configured with API_URL
When a user adds a provider
Then the request goes through the API server

## REMOVED Requirements

### Requirement: Client-Side API Key Storage
The web-ui SHALL NOT store API keys in browser localStorage.

#### Scenario: API Key Removal
Given the previous implementation stored API keys in localStorage
When migrating to the new architecture
Then API keys are only stored encrypted on the server
