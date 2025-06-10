# PRISMA Admin System Documentation

## Overview

PRISMA features a comprehensive dual-user system with two distinct privilege levels:

1. **Customer Accounts** - Paying SaaS customers with subscription-based features
2. **Admin Accounts** - Internal team members with administrative privileges

## User Account Types

### Customer Accounts

Customer accounts represent paying SaaS users with different subscription tiers:

#### Subscription Plans

| Plan | Price | Portfolios | AI Enhancements | Custom Domain | Analytics | Priority Support |
|------|-------|------------|-----------------|---------------|-----------|------------------|
| **Free** | $0/month | 1 | 3/month | ❌ | ❌ | ❌ |
| **Pro** | $29/month | 5 | 50/month | ✅ | ✅ | ❌ |
| **Business** | $79/month | 25 | 200/month | ✅ | ✅ | ✅ |
| **Enterprise** | $299/month | Unlimited | Unlimited | ✅ | ✅ | ✅ |

#### Customer Features
- Portfolio creation and management
- AI-powered content enhancement
- Template customization
- Subscription management
- Usage tracking and limits
- Feature access based on plan

### Admin Accounts

Admin accounts are for internal PRISMA team members with hierarchical privilege levels:

#### Admin Role Hierarchy

1. **Admin Viewer** (`admin_viewer`)
   - View-only access to admin panels
   - Can read user data, portfolios, subscriptions
   - Cannot make changes

2. **Admin Support** (`admin_support`) 
   - Customer support capabilities
   - Can view and update user profiles
   - Can moderate content
   - Can impersonate users for support
   - Can view billing information

3. **Admin Moderator** (`admin_moderator`)
   - Content moderation powers
   - Can suspend users
   - Can delete portfolios
   - Can escalate support tickets

4. **Admin Manager** (`admin_manager`)
   - Full user and content management
   - Can create/update/delete users
   - Can modify subscriptions
   - Can process refunds
   - Can access analytics

5. **Admin Developer** (`admin_developer`)
   - System configuration access
   - Can view system logs
   - Can configure application settings
   - Template management

6. **Admin Architect** (`admin_architect`)
   - Highest privilege level
   - Full system access including infrastructure
   - Can deploy system changes
   - Complete administrative control

## Key Features

### Admin Mode Switching

Admins can seamlessly switch between two views:

```typescript
const { isInAdminMode, switchToAdminMode, switchToUserMode } = useAuth();

// Switch to admin interface
await switchToAdminMode();

// Switch back to user interface
await switchToUserMode();
```

**Admin Mode** shows:
- User management dashboard
- System analytics
- Administrative controls
- Full user database access

**User Mode** shows:
- Regular customer interface
- Portfolio management
- Subscription settings
- Same experience as customers

### User Impersonation

Support admins can impersonate users to help with issues:

```typescript
const { canAccess, impersonateUser, stopImpersonation } = useAuth();

if (canAccess('impersonation:users')) {
  // View the platform as if you were this user
  await impersonateUser('user-id-123');
  
  // Stop impersonation
  await stopImpersonation();
}
```

### Permission-Based Access Control

```typescript
const { canAccess, canAccessFeature } = useAuth();

// Check admin permissions
if (canAccess('users:delete')) {
  // Can delete users
}

// Check subscription features
if (canAccessFeature('customDomain')) {
  // User's plan includes custom domains
}
```

## Implementation

### Types and Interfaces

```typescript
// User account types
type UserAccountType = 'customer' | 'admin';
type SubscriptionPlan = 'free' | 'pro' | 'business' | 'enterprise';
type AdminRole = 'admin_viewer' | 'admin_support' | 'admin_moderator' | 
                 'admin_manager' | 'admin_developer' | 'admin_architect';

// Complete user profile
interface User {
  id: string;
  email: string;
  name: string;
  accountType: UserAccountType;
  customerProfile?: CustomerProfile;
  adminProfile?: AdminProfile;
}
```

### Authentication Context

The enhanced `AuthContext` provides:

```typescript
interface AuthContextType {
  // User state
  user: User | null;
  isAdmin: boolean;
  isInAdminMode: boolean;
  isImpersonating: boolean;
  
  // Permission checking
  canAccess: (permission: AdminPermission) => boolean;
  canAccessFeature: (feature: string) => boolean;
  
  // Admin functionality
  switchToAdminMode: () => Promise<void>;
  switchToUserMode: () => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  
  // Subscription info
  subscriptionPlan?: SubscriptionPlan;
  isSubscriptionActive: boolean;
  usageStats: UsageStats;
}
```

### Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type user_account_type NOT NULL DEFAULT 'customer',
  status user_status NOT NULL DEFAULT 'pending_verification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer profiles
CREATE TABLE customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  portfolios_created INTEGER DEFAULT 0,
  ai_enhancements_used INTEGER DEFAULT 0,
  max_portfolios INTEGER NOT NULL,
  max_ai_enhancements INTEGER NOT NULL
);

-- Admin profiles
CREATE TABLE admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  admin_role admin_role NOT NULL,
  department TEXT NOT NULL,
  hire_date DATE NOT NULL,
  is_in_admin_mode BOOLEAN DEFAULT FALSE,
  permissions TEXT[] DEFAULT '{}',
  last_view_switch_at TIMESTAMP WITH TIME ZONE
);
```

## Usage Examples

### Customer Registration

```typescript
// New user signs up - automatically gets customer profile
const { signUp } = useAuth();
await signUp('user@example.com', 'password', 'John Doe');

// Creates:
// - User record with account_type: 'customer'
// - Customer profile with 'free' plan
// - Usage limits: 1 portfolio, 3 AI enhancements
```

### Admin Account Creation

```typescript
// Admin accounts are created manually with specific roles
const adminUser = {
  email: 'admin@prisma.com',
  name: 'Jane Admin',
  accountType: 'admin',
  adminProfile: {
    adminRole: 'admin_manager',
    department: 'engineering',
    permissions: ['users:read', 'users:update', 'portfolios:moderate']
  }
};
```

### Permission Checking

```typescript
function UserManagementButton() {
  const { canAccess } = useAuth();
  
  if (!canAccess('users:delete')) {
    return null; // Hide button if no permission
  }
  
  return (
    <button onClick={deleteUser}>
      Delete User
    </button>
  );
}
```

### Subscription Limits

```typescript
function CreatePortfolioButton() {
  const { hasReachedLimit, usageStats } = useAuth();
  
  const limitReached = hasReachedLimit('portfolios', usageStats.portfoliosCreated);
  
  return (
    <button disabled={limitReached}>
      {limitReached ? 'Upgrade to create more' : 'Create Portfolio'}
    </button>
  );
}
```

## Security Considerations

### Row Level Security (RLS)

```sql
-- Users can only see their own data
CREATE POLICY user_own_data ON users
  FOR ALL USING (auth.uid() = id);

-- Admins can see all data when in admin mode
CREATE POLICY admin_full_access ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE user_id = auth.uid() 
      AND is_in_admin_mode = true
    )
  );
```

### Admin Action Auditing

```sql
-- Log all admin actions for compliance
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Session Management

- Admin mode switches are logged and time-stamped
- Impersonation sessions are tracked and auditable
- Session tokens include permission context
- Automatic session expiry for security

## Testing

Visit `/admin-demo` to see the system in action:

1. **Mock Admin User**: Any email containing 'admin', 'madfam', or 'prisma'
2. **Mock Customer User**: Any other email
3. **Mode Switching**: Toggle between admin and user views
4. **User Impersonation**: Simulate support scenarios
5. **Permission Testing**: UI adapts based on role permissions

## Benefits

### For Customers
- ✅ Clear subscription tiers with defined limits
- ✅ Transparent usage tracking
- ✅ Easy plan upgrades
- ✅ Feature access based on subscription

### For Admins
- ✅ Hierarchical permission system
- ✅ Seamless view switching
- ✅ User impersonation for support
- ✅ Complete audit trail
- ✅ Role-based access control

### For Business
- ✅ Scalable user management
- ✅ Subscription revenue tracking
- ✅ Customer support efficiency
- ✅ Security compliance
- ✅ Team access control

This dual-user system provides PRISMA with enterprise-grade user management while maintaining a smooth customer experience.