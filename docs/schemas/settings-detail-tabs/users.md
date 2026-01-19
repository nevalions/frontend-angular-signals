# Settings - Users Tab

**Tab**: Users

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search users                   [+ Add User]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  [AB]                                                      │
│  John Doe                                                  │
│  john.doe@example.com                                      │
│  Role: User                                                │
│  Created: Jan 15, 2026                                     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [CD]                                                      │
│  Jane Smith                                                │
│  jane.smith@example.com                                    │
│  Role: Admin                                               │
│  Created: Jan 10, 2026                                     │
└─────────────────────────────────────────────────────────────┘
[Items per page: 10 20 50]           [< 1 2 3 >]
```

## What's on the page

- Search field for users by email or name
- "Add User" button → Navigate to user creation page
- List of user cards:
  - Avatar with initials
  - User full name
  - User email
  - Role (User/Admin)
  - Creation date
  - Click to go to user profile
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

**For users list:**
- User id
- User first name
- User last name
- User email
- User role (user/admin)
- User creation date
- User photo URL (optional)
- [Interface: `User`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/paginated?page={page}&items_per_page={items_per_page}&search={search}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
