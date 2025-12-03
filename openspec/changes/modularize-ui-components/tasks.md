# Tasks: Modularize UI Components

## Phase 1: UI Primitives

### 1.1 Create UI Directory Structure

- [ ] 1.1.1 Create `components/ui/` directory
- [ ] 1.1.2 Create `components/ui/index.ts` for exports
- [ ] 1.1.3 Set up consistent file naming (PascalCase.tsx)

### 1.2 Button Component

- [ ] 1.2.1 Create `Button.tsx` with variants (primary, secondary, danger, ghost)
- [ ] 1.2.2 Add size variants (sm, md, lg)
- [ ] 1.2.3 Add disabled and loading states
- [ ] 1.2.4 Add icon support (left/right icons)
- [ ] 1.2.5 Export Button types

### 1.3 Form Components

- [ ] 1.3.1 Create `Input.tsx` with label and error support
- [ ] 1.3.2 Create `TextArea.tsx` with auto-resize option
- [ ] 1.3.3 Create `Select.tsx` with options support
- [ ] 1.3.4 Create `Checkbox.tsx` with label
- [ ] 1.3.5 Create `FormField.tsx` wrapper component

### 1.4 Display Components

- [ ] 1.4.1 Create `Card.tsx` with header/body/footer slots
- [ ] 1.4.2 Create `Badge.tsx` for status indicators
- [ ] 1.4.3 Create `Modal.tsx` with overlay and close button
- [ ] 1.4.4 Create `Tabs.tsx` for tab navigation
- [ ] 1.4.5 Create `LoadingSpinner.tsx` component

## Phase 2: Chat Components

### 2.1 Create Chat Directory

- [ ] 2.1.1 Create `components/chat/` directory
- [ ] 2.1.2 Move/create chat-specific types
- [ ] 2.1.3 Create `components/chat/index.ts` for exports

### 2.2 Message Components

- [ ] 2.2.1 Create `MessageBubble.tsx` with role-based styling
- [ ] 2.2.2 Create `MessageList.tsx` with scroll behavior
- [ ] 2.2.3 Create `TypingIndicator.tsx` for loading state
- [ ] 2.2.4 Create `MessageTimestamp.tsx` component
- [ ] 2.2.5 Add markdown rendering support to MessageBubble

### 2.3 Input Components

- [ ] 2.3.1 Create `MessageInput.tsx` with send button
- [ ] 2.3.2 Add keyboard shortcuts (Enter to send, Shift+Enter for newline)
- [ ] 2.3.3 Add character count indicator
- [ ] 2.3.4 Add attachment button placeholder
- [ ] 2.3.5 Create `ChatHeader.tsx` with model selector placeholder

### 2.4 Refactor ChatInterface

- [ ] 2.4.1 Update ChatInterface to use new components
- [ ] 2.4.2 Move state logic to custom hook (`useChat`)
- [ ] 2.4.3 Reduce ChatInterface to composition of child components
- [ ] 2.4.4 Verify existing functionality still works

## Phase 3: Settings Components

### 3.1 Create Settings Directory

- [ ] 3.1.1 Create `components/settings/` directory
- [ ] 3.1.2 Create `components/settings/index.ts` for exports
- [ ] 3.1.3 Move settings-specific types

### 3.2 Provider Management Components

- [ ] 3.2.1 Create `ProviderList.tsx` for provider listing
- [ ] 3.2.2 Create `ProviderListItem.tsx` for individual provider
- [ ] 3.2.3 Create `ProviderForm.tsx` for add/edit
- [ ] 3.2.4 Create `ProviderFormFields.tsx` for form inputs
- [ ] 3.2.5 Create `ProviderDeleteConfirm.tsx` modal

### 3.3 Model Components

- [ ] 3.3.1 Create `ModelList.tsx` for model listing
- [ ] 3.3.2 Create `ModelListItem.tsx` for individual model
- [ ] 3.3.3 Create `ModelDiscoveryButton.tsx` component
- [ ] 3.3.4 Update ProviderModelCard to use new components

### 3.4 Gateway Components

- [ ] 3.4.1 Create `GatewaySettings.tsx` component
- [ ] 3.4.2 Create `GatewayInfo.tsx` info panel
- [ ] 3.4.3 Create `RoutingMethodSelect.tsx` component

### 3.5 Refactor SettingsPanel

- [ ] 3.5.1 Create `SettingsTabs.tsx` for tab navigation
- [ ] 3.5.2 Create `SettingsHeader.tsx` with close button
- [ ] 3.5.3 Create `SettingsFooter.tsx` with save/cancel
- [ ] 3.5.4 Update SettingsPanel to use new components
- [ ] 3.5.5 Reduce SettingsPanel to composition only

## Phase 4: Layout Components

### 4.1 Create Layout Directory

- [ ] 4.1.1 Create `components/layout/` directory
- [ ] 4.1.2 Create `components/layout/index.ts` for exports

### 4.2 Layout Components

- [ ] 4.2.1 Create `AppShell.tsx` main layout wrapper
- [ ] 4.2.2 Create `Header.tsx` application header
- [ ] 4.2.3 Create `Footer.tsx` application footer
- [ ] 4.2.4 Create `MainContent.tsx` content area

### 4.3 Update App.tsx

- [ ] 4.3.1 Refactor App.tsx to use layout components
- [ ] 4.3.2 Move header/footer markup to new components
- [ ] 4.3.3 Verify routing/navigation works

## Validation

- [ ] All components render correctly
- [ ] Build completes without errors
- [ ] Lint passes
- [ ] Existing functionality preserved
- [ ] Components are properly exported

## Dependencies

- Phase 1 (UI Primitives) should complete first
- Phase 2-3 can run in parallel after Phase 1
- Phase 4 can run in parallel with Phase 2-3
- Final refactoring of parent components depends on child components being ready
