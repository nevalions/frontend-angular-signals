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
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoints:**
  - `GET /api/users/me` - Get current user profile
  - `GET /api/users/{user_id}` - Admin only: Get any user profile with roles

**For updating email:**
- User id
- New email
- [Interface: `UserEmailUpdate`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserSchemaUpdate`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoints:**
  - `PUT /api/users/me` - Update own email
  - `PUT /api/users/{user_id}` - Admin only: Update user email/status

**For changing password:**
- User id
- Old password (current password) - for own password change
- New password
- [Interface: `PasswordChange`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserChangePassword`](../../../../statsboards-backend/src/users/schemas.py) (for own change)
- **Backend API Endpoints:**
  - `POST /api/users/me/change-password` - Change own password (validates current password)
  - `POST /api/users/{user_id}/change-password` - Admin only: Change user password (no validation needed)

**For deleting account:**
- User id
- [Backend API Endpoint:** `DELETE /api/users/{user_id}` - Admin only or self-delete

## Frontend Implementation Notes

**Authentication:**
- Auth token automatically added to all API requests via `authInterceptor`
- Uses `Authorization: Bearer {token}` header
- Interceptor registered in `app.config.ts`

**Authorization:**
- Users can view/edit own profile
- Admin users can view/edit any user profile
- Non-admin users redirected to `/home` when accessing other users' profiles
- Delete option visible only for own profile or admin

## Related Documentation

- [Inline Editable Forms Pattern](../inline-editable-forms-pattern.md) - For email field editing
- [Alert Pattern](../alert-patterns.md) - For feedback on updates
- [Person Detail Schema](../person-detail.md) - Similar entity header pattern
