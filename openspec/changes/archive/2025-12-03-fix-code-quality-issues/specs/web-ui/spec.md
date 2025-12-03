## ADDED Requirements

### Requirement: Type-Safe API Request/Response Handling

The web-ui components SHALL use properly typed interfaces for all API request and response data instead of using the `any` type.

#### Scenario: Model discovery response parsing

- **WHEN** the ModelDiscoveryService receives a response from a provider
- **THEN** the response SHALL be parsed using a defined ModelResponse interface

#### Scenario: Provider configuration form handling

- **WHEN** the SettingsPanel handles provider form data
- **THEN** all form handlers SHALL use properly typed parameters

### Requirement: React Hooks Best Practices

The web-ui components SHALL follow React hooks rules including proper dependency arrays and function declaration ordering.

#### Scenario: Effect dependencies are complete

- **WHEN** a useEffect hook references external values
- **THEN** those values SHALL be included in the dependency array or wrapped in useCallback

#### Scenario: Functions are declared before use

- **WHEN** a function is used inside a useEffect or other hook
- **THEN** the function SHALL be declared before the hook or defined inside it

### Requirement: Component Props Interface

Components SHALL define meaningful props interfaces or use React.FC without type parameters when no props are needed.

#### Scenario: Empty props interface replacement

- **WHEN** a component does not require any props
- **THEN** the component SHALL be declared as `React.FC` without a props interface OR with a comment explaining why an empty interface is intentional
