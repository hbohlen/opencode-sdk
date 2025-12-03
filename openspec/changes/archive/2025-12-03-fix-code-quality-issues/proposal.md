# Change: Fix Code Quality Issues

## Why

The web-ui codebase has 33 lint errors including TypeScript type safety issues, React hooks violations, and code organization problems that need to be resolved to maintain code quality and prevent runtime bugs.

## What Changes

- Fix empty interface declaration in ChatInterface.tsx
- Replace `any` types with proper TypeScript types across 8 files
- Fix `resetForm` function declaration order in SettingsPanel.tsx
- Address missing React Hook dependencies in useEffect hooks
- Remove unused variables
- **BREAKING**: None - these are internal code quality improvements

## Impact

- Affected specs: web-ui
- Affected code:
  - web-ui/src/components/ChatInterface.tsx
  - web-ui/src/components/ProviderModelCard.tsx
  - web-ui/src/components/SettingsPanel.tsx
  - web-ui/src/lib/OpenCodeContext.tsx
  - web-ui/src/lib/opencode-client.ts
  - web-ui/src/services/ModelDiscoveryService.ts
  - web-ui/src/services/ProviderRouter.ts
  - web-ui/src/types/EnhancedProvider.ts
