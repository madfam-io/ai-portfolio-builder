# Zustand Store Architecture

This directory contains the global state management system built with Zustand, providing a scalable, type-safe solution for managing application state.

## 📁 Structure

```
lib/store/
├── auth-store.ts        # Authentication state and operations
├── portfolio-store.ts   # Portfolio data management
├── ui-store.ts          # UI state (theme, modals, toasts)
├── ai-store.ts          # AI model selection and enhancement history
├── root-store.ts        # Combined store for cross-store communication
├── types.ts             # TypeScript type definitions
├── hooks.ts             # Custom hooks for accessing store state
├── utils.ts             # Store utilities and common patterns
├── middleware.ts        # Custom middleware (logging, undo/redo, etc.)
├── provider.tsx         # Store provider component
├── test-utils.ts        # Testing utilities
└── index.ts             # Central export point
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { useUser, useTheme, useToasts } from '@/lib/store';

function MyComponent() {
  // Access user state
  const { user, isAuthenticated, isLoading } = useUser();
  
  // Manage theme
  const { theme, toggleTheme } = useTheme();
  
  // Show notifications
  const { success, error } = useToasts();
  
  const handleAction = async () => {
    try {
      // Do something
      success('Action completed!');
    } catch (err) {
      error('Action failed', err.message);
    }
  };
}
```

### Accessing Stores Directly

```typescript
import { useAuthStore, usePortfolioStore, useUIStore, useAIStore } from '@/lib/store';

// In a component
function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const portfolios = usePortfolioStore((state) => state.portfolios);
  const theme = useUIStore((state) => state.theme);
  const selectedModels = useAIStore((state) => state.selectedModels);
}

// Outside React (in API routes, utilities, etc.)
import { getAuthStore, getUIStore } from '@/lib/store';

function someUtility() {
  const { user } = getAuthStore();
  const { showToast } = getUIStore();
}
```

## 🎯 Store Details

### Auth Store

Manages authentication state and operations.

```typescript
// State
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Usage
const { signIn, signUp, signOut } = useAuthStore();

await signIn(email, password);
await signOut(); // Automatically resets other stores
```

### Portfolio Store

Handles portfolio CRUD operations and editing state.

```typescript
// State
interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  isEditing: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

// Usage
const { loadPortfolios, createPortfolio, updatePortfolio } = usePortfolioStore();

const portfolio = await createPortfolio({
  title: 'My Portfolio',
  template: 'developer',
});
```

### UI Store

Controls UI elements like theme, modals, and toasts. Theme preference is persisted.

```typescript
// State
interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modals: Modal[];
  toasts: Toast[];
  globalLoading: boolean;
}

// Usage
const { setTheme, showToast, openModal } = useUIStore();

// Show notifications
showSuccessToast('Portfolio saved!');
showErrorToast('Failed to save', 'Please try again');

// Manage modals
openModal({
  id: 'edit-profile',
  component: EditProfileModal,
  props: { userId: '123' },
});
```

### AI Store

Manages AI model selection and enhancement history. Model preferences and quotas are persisted.

```typescript
// State
interface AIState {
  selectedModels: {
    bio: string;
    project: string;
    template: string;
  };
  availableModels: AIModel[];
  enhancementHistory: AIEnhancement[];
  quotaUsed: number;
  quotaLimit: number;
}

// Usage
const { enhanceBio, enhanceProject, setSelectedModel } = useAIStore();

// Select model
setSelectedModel('bio', 'meta-llama/Meta-Llama-3.1-8B-Instruct');

// Enhance content
const enhanced = await enhanceBio('Software developer with 5 years experience');
```

## 🪝 Custom Hooks

### `useUser()`
Access authenticated user data with loading state.

```typescript
const { user, isAuthenticated, isLoading, isGuest } = useUser();
```

### `useCurrentPortfolio()`
Manage the currently edited portfolio with helper methods.

```typescript
const { portfolio, updateField, save, isEditing, isSaving } = useCurrentPortfolio();

// Update a field
updateField('title', 'New Title');

// Update nested field
updateNestedField('theme.primaryColor', '#007bff');

// Save changes
await save();
```

### `useTheme()`
Theme management with system detection.

```typescript
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
```

### `useToasts()`
Convenient toast notification management.

```typescript
const { success, error, warning, info, toasts, remove } = useToasts();

success('Profile updated');
error('Failed to save', 'Network error');
```

### `useModal()`
Modal state management for specific modal IDs.

```typescript
const { isOpen, open, close } = useModal('edit-profile');

open(EditProfileModal, { userId: '123' });
```

### `useGlobalLoading()`
Global loading state with message support.

```typescript
const { isLoading, message, withLoading } = useGlobalLoading();

const result = await withLoading(
  async () => await fetchData(),
  'Loading data...'
);
```

### `useAIModels()`
AI model selection with quota tracking.

```typescript
const { selectedModels, availableModels, quota, selectModel } = useAIModels();

if (!quota.isExceeded) {
  selectModel('bio', modelId);
}
```

## 🛠️ Utilities

### Async Action Wrapper

```typescript
import { createAsyncAction } from '@/lib/store/utils';

const savePortfolio = createAsyncAction(
  async (data) => {
    return await api.savePortfolio(data);
  },
  {
    loadingMessage: 'Saving portfolio...',
    successMessage: 'Portfolio saved!',
    errorMessage: 'Failed to save portfolio',
  }
);
```

### Loading State Management

```typescript
const MyStore = create((set, get) => ({
  ...createLoadingSlice(),
  
  fetchData: async () => {
    get().startLoading('fetch');
    try {
      const data = await api.getData();
      // ...
    } finally {
      get().stopLoading('fetch');
    }
  },
}));
```

### Optimistic Updates

```typescript
import { createOptimisticUpdate } from '@/lib/store/utils';

const updateItem = (id, data) => 
  createOptimisticUpdate(
    // Optimistic update
    (state) => {
      const item = state.items.find(i => i.id === id);
      if (item) Object.assign(item, data);
    },
    // Actual update
    async () => await api.updateItem(id, data),
    // Rollback on error
    (state, error) => {
      // Revert changes
      console.error('Update failed:', error);
    }
  );
```

## 🧪 Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store';
import { resetStores } from '@/lib/store/test-utils';

describe('AuthStore', () => {
  beforeEach(() => {
    resetStores(useAuthStore);
  });

  it('should sign in user', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
```

## 🔄 Persistence

Certain store slices are automatically persisted to localStorage:

- **UI Store**: Theme preference
- **AI Store**: Model selections and quota usage

```typescript
// Persistence is automatic, but you can access persisted data directly:
const persistedUI = localStorage.getItem('ui-store');
const persistedAI = localStorage.getItem('ai-store');
```

## 📊 DevTools

All stores are integrated with Redux DevTools for debugging:

1. Install Redux DevTools Extension
2. Open DevTools in your browser
3. Navigate to Redux tab
4. You'll see all store actions and state changes

## 🚨 Best Practices

1. **Use selectors with shallow comparison** to prevent unnecessary re-renders:
   ```typescript
   const { user, isLoading } = useAuthStore(
     (state) => ({ user: state.user, isLoading: state.isLoading }),
     shallow
   );
   ```

2. **Keep stores focused** - each store should have a single responsibility

3. **Use the provided hooks** instead of accessing stores directly when possible

4. **Handle errors gracefully** - all async operations should have error handling

5. **Reset stores on logout** - the auth store automatically handles this

6. **Use TypeScript** - all stores are fully typed for better DX

## 🔗 Cross-Store Communication

The root store enables cross-store communication:

```typescript
// In auth store's signOut method
signOut: async () => {
  await supabase.auth.signOut();
  
  // Reset other stores
  usePortfolioStore.getState().resetPortfolios();
  useAIStore.getState().clearHistory();
  useUIStore.getState().clearToasts();
};
```

## 📝 Adding New Stores

1. Create store file in `lib/store/`
2. Add types to `types.ts`
3. Update `root-store.ts` to include new store
4. Create custom hooks in `hooks.ts`
5. Export from `index.ts`
6. Add tests

Example:
```typescript
// lib/store/my-new-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyNewState {
  data: any[];
  isLoading: boolean;
}

interface MyNewActions {
  loadData: () => Promise<void>;
  reset: () => void;
}

export const useMyNewStore = create<MyNewState & MyNewActions>()(
  devtools(
    (set) => ({
      data: [],
      isLoading: false,
      
      loadData: async () => {
        set({ isLoading: true });
        try {
          const data = await fetchData();
          set({ data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      reset: () => set({ data: [], isLoading: false }),
    }),
    { name: 'my-new-store' }
  )
);
```