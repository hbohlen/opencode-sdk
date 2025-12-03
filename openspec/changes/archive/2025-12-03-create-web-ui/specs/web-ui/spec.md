# Spec: Web UI Core Requirements

## ADDED Requirements

### Requirement: React TypeScript Setup

The web application MUST provide a complete React + TypeScript setup with Vite build system integrated with the existing opencode-sdk project.

#### Scenario: Project Initialization

- Given the opencode-sdk project exists
- When I run the setup commands
- Then I have a functional React web application with TypeScript configured

#### Scenario: Development Server

- Given the web application is configured
- When I run `npm run dev`
- Then I can access the application at http://localhost:5173

### Requirement: OpenCode SDK Integration

The application MUST integrate with @opencode-ai/sdk to provide OpenCode functionality through the web interface.

#### Scenario: SDK Client Initialization

- Given the @opencode-ai/sdk is available
- When the application starts
- Then the SDK client is properly initialized with configuration

#### Scenario: OpenCode Interaction

- Given the SDK is initialized
- When I send a request through the web UI
- Then the OpenCode response is displayed in the interface

### Requirement: Web Chat Interface

The application MUST provide a simple but functional web interface for OpenCode interactions.

#### Scenario: Chat Interface

- Given the application is running
- When I access the main interface
- Then I see a chat-like interface for OpenCode interactions

#### Scenario: Input Handling

- Given I am in the chat interface
- When I type a message and send it
- Then my input is processed and sent to OpenCode

### Requirement: VPS Deployment Ready

The application MUST be deployable on a VPS server and accessible via URL.

#### Scenario: Production Build

- Given the application is complete
- When I run the build command
- Then I get optimized static files ready for deployment

#### Scenario: Server Configuration

- Given the built application
- When I deploy to my VPS
- Then I can access the application via my server's URL

## MODIFIED Requirements

None - This is a new capability.

## REMOVED Requirements

None - This is a new capability.
