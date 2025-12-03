# Tasks: Add Testing Infrastructure

## Phase 1: Framework Setup

### 1.1 Install Dependencies

- [ ] 1.1.1 Add vitest as devDependency
- [ ] 1.1.2 Add @testing-library/react as devDependency
- [ ] 1.1.3 Add @testing-library/user-event as devDependency
- [ ] 1.1.4 Add @testing-library/jest-dom as devDependency
- [ ] 1.1.5 Add jsdom as devDependency
- [ ] 1.1.6 Add @vitest/coverage-v8 for coverage

### 1.2 Configuration

- [ ] 1.2.1 Create vitest.config.ts
- [ ] 1.2.2 Configure jsdom environment
- [ ] 1.2.3 Set up path aliases to match tsconfig
- [ ] 1.2.4 Configure coverage thresholds
- [ ] 1.2.5 Add test scripts to package.json:
  - `test`: Run tests
  - `test:watch`: Run tests in watch mode
  - `test:coverage`: Run with coverage

### 1.3 Test Setup Files

- [ ] 1.3.1 Create `src/test/setup.ts` for global setup
- [ ] 1.3.2 Configure @testing-library/jest-dom matchers
- [ ] 1.3.3 Create global mocks (localStorage, fetch)
- [ ] 1.3.4 Set up cleanup after each test

## Phase 2: Test Utilities

### 2.1 Mock Factories

- [ ] 2.1.1 Create `src/test/mocks/` directory
- [ ] 2.1.2 Create mock provider factory
- [ ] 2.1.3 Create mock model factory
- [ ] 2.1.4 Create mock message factory
- [ ] 2.1.5 Create mock storage adapter

### 2.2 Test Helpers

- [ ] 2.2.1 Create `src/test/utils/` directory
- [ ] 2.2.2 Create `renderWithProviders` helper for React context
- [ ] 2.2.3 Create `waitForAsync` helper for async operations
- [ ] 2.2.4 Create `mockFetch` utility for API mocking
- [ ] 2.2.5 Export all utilities from index

### 2.3 Test Fixtures

- [ ] 2.3.1 Create `src/test/fixtures/` directory
- [ ] 2.3.2 Create sample provider configurations
- [ ] 2.3.3 Create sample model data
- [ ] 2.3.4 Create sample message threads
- [ ] 2.3.5 Create sample API responses

## Phase 3: Service Tests

### 3.1 ModelDiscoveryService Tests

- [ ] 3.1.1 Create `ModelDiscoveryService.test.ts`
- [ ] 3.1.2 Test `discoverModels` with valid provider
- [ ] 3.1.3 Test `discoverModels` with invalid URL
- [ ] 3.1.4 Test `discoverModels` with network error
- [ ] 3.1.5 Test `testProviderConnection`

### 3.2 ProviderRouter Tests

- [ ] 3.2.1 Create `ProviderRouter.test.ts`
- [ ] 3.2.2 Test `determineRoutingMethod` for different providers
- [ ] 3.2.3 Test `executeRequest` with direct routing
- [ ] 3.2.4 Test `executeRequest` with gateway routing
- [ ] 3.2.5 Test fallback behavior

### 3.3 ConnectionHealthMonitor Tests

- [ ] 3.3.1 Create `ConnectionHealthMonitor.test.ts`
- [ ] 3.3.2 Test `addProvider` and `removeProvider`
- [ ] 3.3.3 Test health check execution
- [ ] 3.3.4 Test health status callbacks
- [ ] 3.3.5 Test start/stop monitoring

## Phase 4: Component Tests

### 4.1 UI Primitive Tests

- [ ] 4.1.1 Create basic tests for Button (after UI modularization)
- [ ] 4.1.2 Create basic tests for Input
- [ ] 4.1.3 Create basic tests for Modal

### 4.2 ChatInterface Tests

- [ ] 4.2.1 Create `ChatInterface.test.tsx`
- [ ] 4.2.2 Test initial message rendering
- [ ] 4.2.3 Test message input and submission
- [ ] 4.2.4 Test loading state display
- [ ] 4.2.5 Test settings panel toggle

### 4.3 SettingsPanel Tests

- [ ] 4.3.1 Create `SettingsPanel.test.tsx`
- [ ] 4.3.2 Test panel open/close
- [ ] 4.3.3 Test tab switching
- [ ] 4.3.4 Test provider form validation
- [ ] 4.3.5 Test provider add/edit/delete

### 4.4 ProviderModelCard Tests

- [ ] 4.4.1 Create `ProviderModelCard.test.tsx`
- [ ] 4.4.2 Test health status display
- [ ] 4.4.3 Test model discovery button
- [ ] 4.4.4 Test model list rendering
- [ ] 4.4.5 Test error state display

## Phase 5: Context Tests

### 5.1 OpenCodeContext Tests

- [ ] 5.1.1 Create `OpenCodeContext.test.tsx`
- [ ] 5.1.2 Test initialization
- [ ] 5.1.3 Test provider management methods
- [ ] 5.1.4 Test model discovery integration
- [ ] 5.1.5 Test health monitoring integration

## Phase 6: CI Integration

### 6.1 GitHub Actions

- [ ] 6.1.1 Add test step to existing workflow (if exists)
- [ ] 6.1.2 Configure test to run on PR
- [ ] 6.1.3 Add coverage upload (optional)
- [ ] 6.1.4 Set coverage thresholds for PR checks

## Validation

- [ ] All tests pass
- [ ] Coverage meets minimum threshold (e.g., 60%)
- [ ] Test script works: `npm test`
- [ ] Watch mode works: `npm run test:watch`
- [ ] Coverage report generates: `npm run test:coverage`

## Dependencies

- Phase 1 must complete before all other phases
- Phase 2 should complete before Phases 3-5
- Phases 3-5 can run in parallel
- Phase 6 can start after Phase 1

## Notes

- Tests should follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names that explain the scenario
- Mock external dependencies, don't make real API calls
- Keep tests focused on one behavior each
