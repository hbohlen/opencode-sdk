# LiteLLM Gateway Integration Spec

## ADDED Requirements

### Requirement: LiteLLM SDK Integration
The system SHALL integrate the LiteLLM SDK as a gateway/proxy layer for API requests to problematic providers like Z.ai.

#### Scenario: Gateway Initialization
Given the OpenCode system with LiteLLM gateway capability
When the system initializes
Then the LiteLLM SDK should be properly configured and available for routing

### Requirement: Smart Routing Logic
The system SHALL implement intelligent routing between direct API calls and LiteLLM gateway based on provider connectivity.

#### Scenario: Routing Decision
Given a provider request needs to be made
When the system evaluates the provider
Then it should route through direct API if possible, otherwise through LiteLLM gateway

### Requirement: Z.ai Connectivity Fix
The system SHALL resolve Z.ai API connectivity issues through LiteLLM gateway routing.

#### Scenario: Z.ai Request
Given a request to Z.ai API endpoint
When direct API call would fail due to CORS/network issues
Then the request should be routed through LiteLLM gateway and succeed

### Requirement: Provider Classification
The system SHALL classify providers into "Direct API" or "Gateway Required" categories.

#### Scenario: Provider Classification
Given a new provider configuration
When the system tests connectivity
Then it should classify the provider appropriately and route accordingly

## MODIFIED Requirements

### Requirement: Enhanced Provider Configuration
Existing provider configuration SHALL be enhanced to include routing method and gateway settings.

#### Scenario: Enhanced Configuration
Given an existing provider configuration
When the system upgrades to gateway capability
Then the provider should continue to work with additional routing options

## REMOVED Requirements