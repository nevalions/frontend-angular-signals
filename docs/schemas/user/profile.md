# User Profile Page Schema

**Route**: `/users/:userId`

**Access**: Can be viewed by the user themselves or by admin users

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Username                         [⋮] │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Status: [Active/Inactive]                                  │
│  Roles: [Admin/User]                                        │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Email                                                      │
│  [user@example.com]                      [✏️]               │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Change Password                                            │
│                                                             │
│  Current Password *                                         │
│  [••••••••]                                                 │
│                                                             │
│  New Password *                                             │
│  [••••••••]                                                 │
│                                                             │
│  Confirm Password *                                         │
│  [••••••••]                                                 │
│                                                             │
│                                [Cancel] [Change Password]   │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

### Navigation
- Back button → Navigate to previous page or home
- Entity header shows username (read-only)
- Gear menu (⋮) with delete item → Confirm and delete user account
  - Delete is visible for own profile or admin users

### Profile Information
- **Status**: Display user active/inactive status (read-only)
  - Active: Green indicator
  - Inactive: Red/gray indicator
- **Roles**: Display user roles (admin, user, etc.) as badges/tags (read-only)
- **Email**: User email with inline edit capability

### Email Field (Inline Edit)
- **View mode**: Show email with edit icon on hover
- **Edit mode**: Email input field with save/cancel icons
- **Validation**: Email format required
- **Save**: Update email via API

### Change Password Section
- **Current Password**: Required field, masked input
- **New Password**: Required field, masked input with validation (minimum length, etc.)
- **Confirm Password**: Required field, must match new password
- **Cancel**: Clear form and return to view mode
- **Change Password**: Submit password change request
  - Validates current password
  - Updates password if valid
  - Shows success/error alert

## What we need from backend

**For user profile details:**
- User id
- Username (read-only)
- Email
- Is active status
- User roles (list of role names)
- Person id (optional, linked person)
- [Interface: `User` or `UserInfo`](../../../src/app/features/auth/models/login-response.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py) (verify)
- **Backend API Endpoint:** `GET /api/users/id/{user_id}/` (verify endpoint exists)

**For updating email:**
- User id
- New email
- [Interface: `UserEmailUpdate`](../../../src/app/features/auth/models/user.model.ts) (create if needed)
- [Backend Schema: `UserEmailUpdateSchema`](../../../../statsboards-backend/src/users/schemas.py) (verify)
- **Backend API Endpoint:** `PATCH /api/users/id/{user_id}/email` or `PUT /api/users/id/{user_id}/` (verify)

**For changing password:**
- User id
- Current password
- New password
- [Interface: `PasswordChange`](../../../src/app/features/auth/models/user.model.ts) (create if needed)
- [Backend Schema: `PasswordChangeSchema`](../../../../statsboards-backend/src/users/schemas.py) (verify)
- **Backend API Endpoint:** `POST /api/users/id/{user_id}/change-password` (verify)

**For deleting account:**
- User id
- [Backend API Endpoint:** `DELETE /api/users/id/{user_id}/` (verify)

## TODOs (Backend endpoints to verify)

- [ ] Verify user profile endpoint: `GET /api/users/id/{user_id}/`
- [ ] Verify email update endpoint: `PATCH /api/users/id/{user_id}/email` or `PUT /api/users/id/{user_id}/`
- [ ] Verify password change endpoint: `POST /api/users/id/{user_id}/change-password`
- [ ] Verify delete user endpoint: `DELETE /api/users/id/{user_id}/`
- [ ] Check if backend has `UserSchema`, `UserEmailUpdateSchema`, `PasswordChangeSchema` definitions

## Related Documentation

- [Inline Editable Forms Pattern](../inline-editable-forms-pattern.md) - For email field editing
- [Alert Pattern](../alert-patterns.md) - For feedback on updates
- [Person Detail Schema](../person-detail.md) - Similar entity header pattern
