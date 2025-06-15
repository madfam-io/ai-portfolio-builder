# ADR-002: State Management with Zustand

**Date**: June 2025  
**Status**: Accepted  
**Decision Makers**: PRISMA Development Team

## Context

PRISMA requires a robust state management solution for:
- User authentication state
- Portfolio data and drafts
- UI preferences and settings
- AI model selections and preferences
- Real-time collaboration features (future)

We evaluated several options:
- Redux Toolkit: Powerful but complex, too much boilerplate
- Context API: Simple but performance concerns at scale
- Jotai: Good but less community support
- Zustand: Simple, performant, TypeScript-friendly

## Decision

We will use Zustand as our primary state management solution with the following architecture:

### Store Structure

```typescript
lib/store/
├── auth-store.ts       # Authentication state
├── portfolio-store.ts  # Portfolio CRUD operations
├── ui-store.ts        # UI preferences
├── ai-store.ts        # AI model preferences
└── experiments-store.ts # A/B testing state
```

### Implementation Patterns

1. **Domain Separation**: Each store handles a specific domain
2. **TypeScript First**: Full type safety with interfaces
3. **Persistence**: LocalStorage/SessionStorage integration
4. **Middleware**: Logger and devtools in development
5. **Selective Subscriptions**: Optimize re-renders

### Example Store

```typescript
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        login: async (credentials) => {
          // Implementation
        },
        // ...
      }),
      { name: 'auth-storage' }
    )
  )
);
```

## Consequences

### Positive

- Minimal boilerplate compared to Redux
- Excellent TypeScript support
- Small bundle size (~2.9kb)
- No providers needed, works anywhere
- Built-in middleware support
- Easy to test and mock
- Great developer experience

### Negative

- Less ecosystem than Redux
- No time-travel debugging
- Less suitable for very complex state logic
- Potential for store proliferation

### Neutral

- Different mental model from Redux
- Requires discipline to maintain store boundaries

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [State Management Comparison](https://blog.logrocket.com/zustand-vs-redux/)
- lib/store/README.md in project

---

_ADR Created: June 2025_  
_Last Updated: June 15, 2025_