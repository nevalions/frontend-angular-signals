# Route Guards & Security Patterns

This document covers route guard implementation, security patterns, and authentication/authorization in the application.

## Overview

Route guards protect application routes by preventing unauthorized access. They check authentication status and user roles before allowing navigation to protected routes.

## Available Guards

### `authGuard`
**Purpose**: Basic authentication check

**Behavior**:
- Allows access if user is authenticated
- Redirects to `/home` if user is not authenticated

**Use Cases**:
- Routes that require user login
- Profile pages, settings, user-specific content

**Implementation**:
```typescript
canActivate: [authGuard]
```

### `adminGuard`
**Purpose**: Admin-only access control

**Behavior**:
- Allows access if user is authenticated AND has `admin` role
- Redirects to `/home` if user is not authenticated or lacks admin role

**Use Cases**:
- Routes that require admin privileges
- User management, system configuration, sensitive operations

**Implementation**:
```typescript
canActivate: [authGuard, adminGuard]
```

### `settingsAdminGuard`
**Purpose**: Settings page with tab-based authorization

**Behavior**:
- Requires authentication for all tabs
- Requires admin role for sensitive tabs: `users`, `roles`, `global-settings`
- Allows non-admin users to access: `dashboard` tab
- Redirects to `/home` for unauthorized access

**Use Cases**:
- Settings page with mixed access levels
- When different sections within a route have different authorization requirements

**Implementation**:
```typescript
canActivate: [authGuard, settingsAdminGuard]
```

### `scoreboardAdminGuard`
**Purpose**: Scoreboard admin access with owner support

**Behavior**:
- Requires authentication
- Allows access if user has `admin` or `editor` role
- Allows access if user is the owner of the scoreboard (checks `match.user_id` against current user)
- Redirects to `/home` for unauthorized access
- Fetches match data to verify ownership when user lacks admin/editor role

**Use Cases**:
- Scoreboard admin page where owners can manage their own scoreboards
- Routes that need to allow both admins and resource owners

**Implementation**:
```typescript
canActivate: [scoreboardAdminGuard]
```

**How it works**:
1. Checks if user is authenticated (redirects to `/home` if not)
2. Checks if user has `admin` or `editor` role (grants access if true)
3. Extracts `matchId` from route parameters
4. Fetches match data and compares `match.user_id` with current user's ID
5. Grants access if user is the owner, otherwise redirects to `/home`

## Protected Routes

| Route | Guards | Access Requirements |
|-------|---------|-------------------|
| `/settings` | `authGuard`, `settingsAdminGuard` | Authenticated, admin for sensitive tabs |
| `/settings?tab=dashboard` | `authGuard`, `settingsAdminGuard` | Authenticated (any role) |
| `/settings?tab=users` | `authGuard`, `settingsAdminGuard` | Authenticated, admin |
| `/settings?tab=roles` | `authGuard`, `settingsAdminGuard` | Authenticated, admin |
| `/settings?tab=global-settings` | `authGuard`, `settingsAdminGuard` | Authenticated, admin |
| `/users/:userId` | `authGuard` | Authenticated (any role) |
| Create routes (teams, matches, etc.) | `authGuard` | Any authenticated user |
| Edit routes (teams, matches, etc.) | `authGuard` + component check | Owner/Editor/Admin |
| Sports create/edit | `adminGuard` | Admin only |
| Scoreboard presets | `adminGuard` | Admin only |
| EESL parse | `adminGuard` | Admin only |
| Scoreboard admin | `scoreboardAdminGuard` | Admin/Editor/Owner |

## Component-Level Access Control

Some components implement additional access control logic beyond route guards:

### UserProfileComponent
The `UserProfileComponent` has built-in access control via the `checkAccess` effect:

```typescript
canView = computed(() => {
  const userId = this.userId();
  const current = this.currentUser();
  return userId === current?.id || current?.roles?.includes('admin');
});

private checkAccess = effect(() => {
  if (!this.canView()) {
    this.router.navigate(['/home']);
  }
});
```

This ensures:
- Users can only view/edit their own profiles
- Admins can view/edit any user's profile
- Access is checked after the route guard (defense in depth)

## Security Best Practices

### 1. Layered Security
Route guards provide the first layer of security. Components should implement additional checks:
- Route guards prevent initial navigation to protected routes
- Component-level checks prevent unauthorized actions within pages
- Backend validation is always required (never trust frontend)

### 2. Role-Based Access Control (RBAC)
Use the `roles` array in `UserInfo` to determine access:
```typescript
if (currentUser?.roles?.includes('admin')) {
  // Allow admin action
}
```

### 3. Defense in Depth
Never rely solely on client-side checks:
- Frontend guards improve UX (prevent unauthorized navigation)
- Backend validation is the source of truth for security
- API endpoints must verify authentication and authorization

### 4. Redirect to Safe Routes
When denying access, redirect to `/home` rather than showing an error:
```typescript
return router.createUrlTree(['/home']);
```

## Adding New Guards

### Step 1: Create the Guard
```typescript
// src/app/core/guards/my-guard.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const myGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (/* your condition */) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
```

### Step 2: Export from Index
```typescript
// src/app/core/guards/index.ts
export * from './my-guard.guard';
```

### Step 3: Update Documentation
- Update this file with guard description
- Add to the guards `README.md` in `src/app/core/guards/`
- Create test file following existing patterns

### Step 4: Apply to Routes
```typescript
{
  path: 'protected-route',
  component: MyComponent,
  canActivate: [authGuard, myGuard],
}
```

### Step 5: Write Security Tests
See existing guard tests:
- `auth.guard.spec.ts`
- `admin.guard.spec.ts`
- `settings-admin.guard.spec.ts`

## Testing Guards

### Unit Tests
Guard tests should cover:
- Unauthenticated access (should redirect)
- Authenticated but unauthorized access (should redirect)
- Authorized access (should return `true`)
- Edge cases (missing roles, null user, etc.)

Example:
```typescript
describe('myGuard', () => {
  it('should redirect unauthenticated user', () => {
    const authServiceMock = {
      isAuthenticated: { call: vi.fn(() => false) },
    };
    TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
    const result = myGuard(null as any, null as any);
    expect(result).toEqual(router.createUrlTree(['/home']));
  });
});
```

### Integration Tests
Test guards with actual router navigation:
```typescript
it('should prevent navigation to protected route when unauthenticated', async () => {
  await router.navigate(['/settings']);
  expect(router.url).toBe('/home');
});
```

## Security Testing

### Security Test Files
Create `*.security.spec.ts` files for components that implement access control:
- `user-profile.component.security.spec.ts`
- `settings.component.security.spec.ts`

### Security Test Checklist
- [ ] Unauthenticated users cannot access protected routes
- [ ] Non-admin users cannot access admin-only features
- [ ] Admin users can access all features
- [ ] Regular users can access their own data only
- [ ] Resource requests respect access control (e.g., `/api/users/me` vs `/api/users/:id`)

## Common Security Mistakes

### ❌ Only Checking Backend
Don't skip frontend guards because "the backend will catch it":
- Poor user experience (user can navigate to pages they can't access)
- Unnecessary API calls to pages that will be rejected

### ❌ Relying Solely on Frontend
Don't trust frontend security:
- Frontend code can be modified by users
- API endpoints must always verify authentication/authorization
- Use guards for UX, backend for actual security

### ❌ Skipping Component-Level Checks
Don't assume route guards protect everything:
- URL parameters can be changed within a page
- Actions can be triggered programmatically
- Component logic should verify permissions

## See Also

- [Service Patterns](./service-patterns.md) - Authentication service patterns
- [Component Patterns](./component-patterns.md) - Component access control
- [API Configuration](./api-configuration.md) - Backend authentication
- [Testing Patterns](./testing-patterns.md) - Testing guarded components

## Guard Files

- **Source**: `src/app/core/guards/`
- **Tests**: `src/app/core/guards/*.guard.spec.ts`
- **Docs**: `src/app/core/guards/README.md`
