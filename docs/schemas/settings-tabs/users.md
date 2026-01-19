# Settings - Users Tab

**Tab**: Users

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search users                      [⬇⬆ Status] [⬇⬆ Username]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  [🟢 Active]                                                │
│  username                                                  │
│  email@example.com                                         │
│  Roles: user                                               │
│  [View User] [Edit] [Deactivate]                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [🔴 Inactive]                                              │
│  username2                                                 │
│  email2@example.com                                        │
│  Roles: user, player                                       │
│  [View User] [Edit] [Activate]                            │
└─────────────────────────────────────────────────────────────┘
                                                               │
                    [< Prev] Page 1 of N [Next >]
```

## What's on the page

- Search field for users (filters by username, email, or person name)
- Sort controls:
  - Sort by Status (asc/desc) - active users first or inactive first
  - Sort by Username (asc/desc)
- List of user cards:
  - Status indicator (🟢 Active / 🔴 Inactive)
  - Username
  - Email
  - Roles list
  - Action buttons:
    - "View User" → Navigate to user detail page (if exists)
    - "Edit" → Edit user modal (email, is_active)
    - "Activate" / "Deactivate" → Toggle user active status
- Pagination controls
- Items per page selector

## What we need from backend

**For users list:**
- User id
- Username
- Email
- is_active status
- Roles list
- [Interface: `User`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?page={page}&items_per_page={items_per_page}&order_by={order_by}&order_by_two={order_by_two}&ascending={ascending}&search={search}&role_names={role_names}`

  - `role_names`: For users tab, filter to exclude "admin" role (e.g., `role_names=user`)
  - `order_by`: "is_active" or "username"
  - `order_by_two`: "username" or "id"
  - `ascending`: true/false

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

**For updating user:**
- User ID
- Email (optional)
- is_active (optional)
- [Interface: `UserSchemaUpdate`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `PUT /api/users/{user_id}`
