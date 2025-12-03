# Change: Modularize UI Components

## Why

The current UI components have several issues that limit maintainability and reusability:

1. **ChatInterface is monolithic** (~175 lines) with inline state management, message handling, and rendering
2. **SettingsPanel is large** (~480 lines) with multiple tabs and form logic
3. **No component composition** - components are not broken into smaller, reusable parts
4. **Inline styles mixed with Tailwind** - inconsistent styling approach
5. **No design system** - UI primitives are recreated in each component

Breaking these into smaller, focused components will:
- Improve testability of individual pieces
- Enable reuse across different layouts
- Make the codebase easier to understand and maintain
- Allow for easier theming and styling changes

## What Changes

### Message Components
- Extract `MessageBubble` component from ChatInterface
- Create `MessageList` container component
- Add `TypingIndicator` as separate component
- Create `MessageInput` component with send logic

### Settings Components
- Split SettingsPanel into:
  - `SettingsTabs` (navigation)
  - `ProviderList` (provider management)
  - `ProviderForm` (add/edit provider)
  - `ModelList` (model selection)
  - `GatewaySettings` (gateway configuration)

### UI Primitives
- Create reusable `Button` component with variants
- Create `Input` and `TextArea` components
- Create `Select` component
- Create `Card` component
- Create `Modal` component (extract from SettingsPanel)
- Create `Badge` component for status indicators

### Layout Components
- Create `AppShell` for consistent layout
- Create `Header` component
- Create `Footer` component
- Create `Sidebar` component (for future use)

## Impact

- Affected components: ChatInterface, SettingsPanel, ProviderModelCard, App
- New directories: `components/ui/`, `components/chat/`, `components/settings/`, `components/layout/`
- **BREAKING**: Component props may change during refactoring

## Migration Strategy

1. Create new component directories
2. Extract UI primitives first (lowest risk)
3. Extract message components
4. Extract settings components
5. Update parent components to use new children
6. Remove old inline implementations
