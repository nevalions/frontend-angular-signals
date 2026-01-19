# Route Guards

This directory contains authentication and authorization guards for protecting application routes.

## Guards

### `authGuard`
- **Purpose**: Ensures user is authenticated before accessing protected routes
- **Behavior**: Redirects to `/home` if user is not authenticated
- **Usage**: Applied to routes that require login

### `adminGuard`
- **Purpose**: Ensures user has admin role before accessing admin-only routes
- **Behavior**: Redirects to `/home` if user is not authenticated or lacks admin role
- **Usage**: Applied to routes that require admin privileges

### `settingsAdminGuard`
- **Purpose**: Protects `/settings` route with tab-based authorization
- **Behavior**:
  - Redirects unauthenticated users to `/home` for any tab
  - Redirects non-admin users to `/home` for admin-only tabs (`users`, `roles`, `global-settings`)
  - Allows authenticated non-admin users to access `dashboard` tab
- **Usage**: Applied to `/settings` route with query parameter checking

## Protected Routes

### `/settings`
- **Guards**: `authGuard`, `settingsAdminGuard`
- **Access Control**:
  - `dashboard` tab: All authenticated users
  - `users` tab: Admin only
  - `roles` tab: Admin only
  - `global-settings` tab: Admin only

### `/users/:userId`
- **Guards**: `authGuard`
- **Access Control**: All authenticated users
- **Note**: Additional role-based access control is handled within the component

## Testing

All guards have comprehensive security tests:
- `auth.guard.spec.ts` - Tests authentication checks
- `admin.guard.spec.ts` - Tests admin role verification
- `settings-admin.guard.spec.ts` - Tests tab-based authorization

## Usage Example

```typescript
import { Routes } from '@angular/router';
import { authGuard, adminGuard, settingsAdminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard, settingsAdminGuard],
  },
  {
    path: 'admin-area',
    component: AdminAreaComponent,
    canActivate: [authGuard, adminGuard],
  },
];
```
