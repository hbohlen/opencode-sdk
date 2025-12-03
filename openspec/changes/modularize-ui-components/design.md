# Design: UI Component Architecture

## Context

The current UI components are large and monolithic. ChatInterface handles messages, input, loading state, and settings toggle. SettingsPanel handles tabs, provider management, model discovery, and form submission all in one file.

## Goals / Non-Goals

### Goals
- Break components into smaller, focused pieces
- Create reusable UI primitives
- Enable independent testing of components
- Improve code navigation and discoverability

### Non-Goals
- Create a separate component library package
- Support multiple design systems simultaneously
- Implement component documentation site (Storybook)

## Component Hierarchy

```
App
├── AppShell
│   ├── Header
│   │   └── AppTitle
│   ├── MainContent
│   │   └── ChatInterface
│   │       ├── ChatHeader
│   │       │   ├── ModelSelector (future)
│   │       │   └── SettingsButton
│   │       ├── MessageList
│   │       │   ├── MessageBubble
│   │       │   │   └── MessageTimestamp
│   │       │   └── TypingIndicator
│   │       └── MessageInput
│   │           ├── TextArea
│   │           └── Button
│   └── Footer
│       └── FooterText
└── SettingsPanel (Modal)
    ├── Modal
    ├── SettingsHeader
    ├── SettingsTabs
    │   └── Tab
    ├── ProvidersTab
    │   ├── ProviderList
    │   │   └── ProviderListItem
    │   │       └── Badge (health status)
    │   └── ProviderForm
    │       ├── Input (name, baseUrl, apiKey)
    │       ├── Select (routingMethod)
    │       ├── Checkbox (preferences)
    │       └── TextArea (customHeaders)
    ├── ModelsTab
    │   └── ModelList
    │       └── ProviderModelCard
    │           └── ModelListItem
    └── SettingsFooter
        └── Button (save, cancel)
```

## UI Primitives Design

### Button Variants

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Usage
<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>

<Button variant="danger" size="sm" loading={isDeleting}>
  Delete
</Button>
```

### Form Components

```typescript
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  type?: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
```

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Usage
<Modal isOpen={showSettings} onClose={() => setShowSettings(false)} size="lg">
  <SettingsContent />
</Modal>
```

## Directory Structure

```
web-ui/src/components/
├── ui/                        # Reusable UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── TextArea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Tabs.tsx
│   ├── LoadingSpinner.tsx
│   └── index.ts
├── chat/                      # Chat-specific components
│   ├── ChatInterface.tsx      # Refactored main component
│   ├── ChatHeader.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── MessageTimestamp.tsx
│   ├── MessageInput.tsx
│   ├── TypingIndicator.tsx
│   └── index.ts
├── settings/                  # Settings-specific components
│   ├── SettingsPanel.tsx      # Refactored main component
│   ├── SettingsHeader.tsx
│   ├── SettingsTabs.tsx
│   ├── SettingsFooter.tsx
│   ├── ProviderList.tsx
│   ├── ProviderListItem.tsx
│   ├── ProviderForm.tsx
│   ├── ModelList.tsx
│   ├── GatewaySettings.tsx
│   └── index.ts
├── layout/                    # Layout components
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MainContent.tsx
│   └── index.ts
└── ProviderModelCard.tsx      # May move to settings/
```

## Component Patterns

### Composition Over Props

Instead of passing many props, use composition:

```tsx
// Instead of:
<SettingsPanel
  activeTab={activeTab}
  onTabChange={setActiveTab}
  providers={providers}
  onProviderAdd={handleAdd}
  onProviderDelete={handleDelete}
  // ... many more props
/>

// Use composition:
<SettingsPanel>
  <SettingsTabs value={activeTab} onChange={setActiveTab}>
    <Tab value="providers">Providers</Tab>
    <Tab value="models">Models</Tab>
  </SettingsTabs>
  <SettingsContent>
    {activeTab === 'providers' && <ProviderList />}
    {activeTab === 'models' && <ModelList />}
  </SettingsContent>
  <SettingsFooter>
    <Button onClick={handleClose}>Close</Button>
  </SettingsFooter>
</SettingsPanel>
```

### Custom Hooks for Logic

Extract state management to hooks:

```typescript
// useChat.ts
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const sendMessage = async (content: string) => {
    // ... send logic
  };

  return {
    messages,
    isLoading,
    input,
    setInput,
    sendMessage,
  };
}

// ChatInterface.tsx
const ChatInterface = () => {
  const { messages, isLoading, input, setInput, sendMessage } = useChat();

  return (
    <div>
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput value={input} onChange={setInput} onSend={sendMessage} />
    </div>
  );
};
```

## Styling Approach

### Tailwind CSS Consistency

Use consistent class patterns:

```tsx
// Define variant styles as objects
const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

const buttonSizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
```

### Component-Level Styles

Keep component styles co-located:

```tsx
// Button.tsx
const baseStyles = 'rounded-md font-medium focus:outline-none focus:ring-2 transition-colors';

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', ...props }) => {
  return (
    <button
      className={`${baseStyles} ${buttonVariants[variant]} ${buttonSizes[size]}`}
      {...props}
    />
  );
};
```

## Risks / Trade-offs

### Risk: Over-Componentization
- **Mitigation**: Only split when there's clear benefit

### Risk: Props Drilling
- **Mitigation**: Use context for deeply nested data

### Trade-off: More Files
- **Accept**: Better organization outweighs file count

### Trade-off: Initial Development Time
- **Accept**: Pays off in maintainability

## Open Questions

1. Should we use CSS modules or stick with Tailwind?
   - **Current answer**: Stick with Tailwind for consistency

2. Should components have default exports or named exports?
   - **TODO**: Decide on convention

3. How to handle component documentation?
   - **TODO**: Consider adding JSDoc or Storybook later
