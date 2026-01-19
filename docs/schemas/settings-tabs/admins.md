# Settings - Admins Tab

**Tab**: Admins

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search admins                      [⬇⬆ Status] [⬇⬆ Username]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  [🟢 Active]                                                │
│  admin_username                                             │
│  admin@example.com                                          │
│  Roles: admin, user                                         │
│  [View Admin] [Edit] [Deactivate]                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [🔴 Inactive]                                              │
│  admin2_username                                            │
│  admin2@example.com                                        │
│  Roles: admin, user, player                                │
│  [View Admin] [Edit] [Activate]                           │
└─────────────────────────────────────────────────────────────┘
                                                               │
                    [< Prev] Page 1 of N [Next >]
```

## What's on the page

- Search field for admins (filters by username, email, or person name)
- Sort controls:
  - Sort by Status (asc/desc) - active admins first or inactive first
  - Sort by Username (asc/desc)
- List of admin cards:
  - Status indicator (🟢 Active / 🔴 Inactive)
  - Username
  - Email
  - Roles list (includes "admin")
  - Action buttons:
    - "View Admin" → Navigate to user detail page (if exists)
    - "Edit" → Edit admin modal (email, is_active, roles)
    - "Activate" / "Deactivate" → Toggle admin active status
- Pagination controls
- Items per page selector

## What we need from backend

**For admins list:**
- User id
- Username
- Email
- is_active status
- Roles list
- [Interface: `User`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?page={page}&items_per_page={items_per_page}&order_by={order_by}&order_by_two={order_by_two}&ascending={ascending}&search={search}&role_names={role_names}`

  - `role_names`: Filter to include only "admin" role (e.g., `role_names=admin`)
  - `order_by`: "is_active" or "username"
  - `order_by_two`: "username" or "id"
  - `ascending`: true/false

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

**For updating admin:**
- User ID
- Email (optional)
- is_active (optional)
- [Interface: `UserSchemaUpdate`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `PUT /api/users/{user_id}`

**For assigning/removing roles (optional - for advanced admin management):**
- Assign role: `POST /api/users/{user_id}/roles`
- Remove role: `DELETE /api/users/{user_id}/roles/{role_id}`
- [Backend Schema: `UserRoleAssign`](../../../../statsboards-backend/src/auth/schemas.py)
