# Core Interfaces Spec

## ADDED Requirements

### Requirement: Framework-Agnostic Service Interfaces
The system SHALL provide TypeScript interfaces for all core services that do not depend on any UI framework.

#### Scenario: Service Interface Definition
Given a developer needs to implement a custom service
When they implement the service interface
Then the implementation can be used with any UI framework (React, Vue, etc.)

### Requirement: Dependency Injection Support
The system SHALL support dependency injection for all services through constructor parameters or factory functions.

#### Scenario: Custom Storage Injection
Given a developer wants to use a custom storage backend
When they create services using the factory function
Then they can provide their own IStorageAdapter implementation

### Requirement: Type Separation
The system SHALL separate provider types into distinct interfaces for configuration, state, and capabilities.

#### Scenario: Provider Type Usage
Given a component needs only provider configuration
When it imports the ProviderConfig type
Then it receives only the static configuration properties without runtime state

## MODIFIED Requirements

### Requirement: Service Testability
Existing services SHALL be refactored to depend on interfaces rather than concrete implementations.

#### Scenario: Unit Testing Services
Given a developer writes unit tests for ProviderService
When they provide mock IStorageAdapter and IHttpClient
Then the tests run without browser APIs or network calls

## REMOVED Requirements

None - this is additive refactoring.
