# Model Discovery Spec

## ADDED Requirements

### Requirement: Real-time Model Discovery
The system shall discover available models from provider /v1/models endpoints in real-time.

#### Scenario: Model Discovery
Given a configured provider
When the system attempts to discover models
Then it should fetch and display the current list of available models

### Requirement: Model Capability Detection
The system shall detect model capabilities (context length, streaming, vision, function calling) from provider endpoints.

#### Scenario: Capability Detection
Given a list of discovered models
When the system processes the model information
Then it should identify and display model capabilities

### Requirement: Model Selection Interface
The system shall provide an interface for selecting models from discovered lists.

#### Scenario: Model Selection
Given a list of discovered models
When the user selects a model
Then the selection should be applied to subsequent OpenCode interactions

## MODIFIED Requirements

## REMOVED Requirements