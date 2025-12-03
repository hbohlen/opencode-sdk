# Design: Testing Infrastructure

## Context

The web-ui lacks any testing infrastructure, making it risky to refactor code or add new features. This design establishes patterns and tooling for comprehensive testing.

## Goals / Non-Goals

### Goals
- Set up test framework with TypeScript support
- Enable component testing with React Testing Library
- Enable unit testing for services
- Provide test utilities and mocks
- Integrate with CI pipeline

### Non-Goals
- End-to-end testing (defer to later proposal)
- Visual regression testing
- Performance testing
- Accessibility testing (include basic, but not comprehensive)

## Technology Choices

### Test Runner: Vitest

**Why Vitest over Jest?**
- Native Vite support (already using Vite)
- Faster execution (ES modules, no transpilation)
- Compatible with Jest API (easy migration)
- Built-in TypeScript support
- Built-in coverage via v8

### Component Testing: React Testing Library

**Why RTL?**
- Tests components as users interact with them
- Encourages accessible markup
- Widely adopted, good documentation
- Works well with Vitest

### DOM Environment: jsdom

**Why jsdom?**
- Standard for React component testing
- Provides DOM APIs in Node.js
- Lighter than happy-dom for most cases

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@components': resolve(__dirname, './src/components'),
      '@test': resolve(__dirname, './src/test'),
    },
  },
});
```

### Test Setup (src/test/setup.ts)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

// Mock console.error for cleaner test output
vi.spyOn(console, 'error').mockImplementation(() => {});
```

## Directory Structure

```
web-ui/src/
├── test/                          # Test utilities and setup
│   ├── setup.ts                   # Global test setup
│   ├── mocks/                     # Mock implementations
│   │   ├── providers.ts           # Mock provider factory
│   │   ├── models.ts              # Mock model factory
│   │   ├── storage.ts             # Mock storage adapter
│   │   └── fetch.ts               # Mock fetch responses
│   ├── fixtures/                  # Test data
│   │   ├── providers.ts           # Sample provider configs
│   │   ├── models.ts              # Sample model data
│   │   └── messages.ts            # Sample chat messages
│   └── utils/                     # Test helpers
│       ├── renderWithProviders.tsx
│       ├── waitFor.ts
│       └── index.ts
├── services/
│   ├── ModelDiscoveryService.ts
│   └── ModelDiscoveryService.test.ts   # Co-located tests
├── components/
│   ├── ChatInterface.tsx
│   └── ChatInterface.test.tsx          # Co-located tests
```

## Test Patterns

### Service Unit Test Pattern

```typescript
// ModelDiscoveryService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelDiscoveryService } from './ModelDiscoveryService';
import { createMockProvider } from '@test/mocks/providers';

describe('ModelDiscoveryService', () => {
  let service: ModelDiscoveryService;
  
  beforeEach(() => {
    service = new ModelDiscoveryService();
    vi.clearAllMocks();
  });

  describe('discoverModels', () => {
    it('should return models for valid provider', async () => {
      // Arrange
      const provider = createMockProvider({ baseUrl: 'https://api.example.com' });
      const mockResponse = {
        data: [{ id: 'model-1', name: 'Model 1' }],
      };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // Act
      const models = await service.discoverModels(provider);

      // Assert
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe('model-1');
    });

    it('should throw error for invalid URL', async () => {
      // Arrange
      const provider = createMockProvider({ baseUrl: '' });

      // Act & Assert
      await expect(service.discoverModels(provider))
        .rejects.toThrow('Base URL is required');
    });
  });
});
```

### Component Test Pattern

```typescript
// ChatInterface.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './ChatInterface';
import { renderWithProviders } from '@test/utils';

describe('ChatInterface', () => {
  it('should render initial greeting message', () => {
    // Arrange & Act
    render(<ChatInterface />);

    // Assert
    expect(screen.getByText(/Hello! I'm your OpenCode assistant/i)).toBeInTheDocument();
  });

  it('should send message when clicking send button', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Act
    await user.type(input, 'Hello, assistant');
    await user.click(sendButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Hello, assistant')).toBeInTheDocument();
    });
  });

  it('should disable send button when input is empty', () => {
    // Arrange & Act
    render(<ChatInterface />);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Assert
    expect(sendButton).toBeDisabled();
  });
});
```

### Mock Factory Pattern

```typescript
// test/mocks/providers.ts
import type { EnhancedProvider } from '@/types/EnhancedProvider';

export function createMockProvider(overrides: Partial<EnhancedProvider> = {}): EnhancedProvider {
  return {
    id: 'mock-provider-1',
    name: 'Mock Provider',
    baseUrl: 'https://api.mock-provider.com',
    apiKey: 'mock-api-key',
    routingMethod: 'direct',
    routingPreferences: {
      preferDirect: true,
      fallbackEnabled: true,
      healthCheckInterval: 30000,
    },
    healthStatus: 'unknown',
    consecutiveFailures: 0,
    ...overrides,
  };
}
```

### Render With Providers Helper

```typescript
// test/utils/renderWithProviders.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { OpenCodeProvider } from '@/lib/OpenCodeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <OpenCodeProvider>{children}</OpenCodeProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Coverage Expectations

Initial coverage targets (can increase over time):
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

Priority for coverage:
1. Services (ProviderRouter, ConnectionHealthMonitor, ModelDiscoveryService)
2. Context (OpenCodeContext)
3. Components (ChatInterface, SettingsPanel)
4. UI Primitives (when created)

## Risks / Trade-offs

### Risk: Test Maintenance Burden
- **Mitigation**: Focus on behavior, not implementation details

### Risk: Flaky Tests
- **Mitigation**: Use proper async utilities, avoid timers

### Trade-off: Test Speed vs Coverage
- **Accept**: Prioritize unit tests, defer E2E tests

### Trade-off: Mocking Complexity
- **Accept**: Create reusable mock factories

## Open Questions

1. Should tests be co-located or in separate `__tests__` directory?
   - **Decision**: Co-located (easier to find, Vitest supports both)

2. Should we add snapshot testing?
   - **TODO**: Evaluate after initial tests are in place

3. How to handle async context initialization in tests?
   - **TODO**: Create utility that waits for initialization
