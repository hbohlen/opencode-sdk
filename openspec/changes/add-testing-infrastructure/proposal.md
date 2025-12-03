# Change: Add Testing Infrastructure

## Why

The web-ui currently has no testing infrastructure. This makes it impossible to:
1. Verify behavior before deployment
2. Catch regressions during refactoring
3. Validate that services work correctly
4. Test components in isolation

Adding testing infrastructure is essential for:
- Enabling confident refactoring (needed for core abstractions and UI modularization)
- Catching bugs before they reach users
- Documenting expected behavior through tests
- Supporting CI/CD workflows

## What Changes

### Test Framework Setup
- Add Vitest as the test runner (fast, Vite-native)
- Configure testing for TypeScript
- Set up test coverage reporting
- Add test scripts to package.json

### Testing Libraries
- Add @testing-library/react for component testing
- Add @testing-library/user-event for user interactions
- Add @testing-library/jest-dom for DOM assertions
- Add jsdom for DOM environment in Node

### Test Utilities
- Create test utilities for common setup
- Add mock factories for services
- Create test fixtures for common data
- Add helper functions for async operations

### Component Testing
- Add example tests for key components
- Create component test patterns
- Document testing best practices

### Service Testing
- Add unit tests for existing services
- Create mock implementations for external dependencies
- Test error handling paths

### CI Integration
- Add test command to CI workflow
- Configure coverage thresholds
- Fail build on test failures

## Impact

- New devDependencies: vitest, @testing-library/*, jsdom
- New files: vitest.config.ts, test setup files, test utilities
- New directories: `__tests__/`, `__mocks__/`
- **NON-BREAKING**: Testing is additive

## Prerequisites

None - this can be implemented independently and enables other proposals.

## Security Considerations

- Test files should not contain real API keys
- Mock data should not include sensitive information
