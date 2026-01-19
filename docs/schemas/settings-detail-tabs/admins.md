# Settings - Admins Tab

**Tab**: Admins

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search admins                  [+ Make Admin]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  [AB]                                                      │
│  John Doe                                                  │
│  john.doe@example.com                                      │
│  Admin since: Jan 15, 2026                                  │
│  [✏️ Edit] [❌ Remove Admin]                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [CD]                                                      │
│  Jane Smith                                                │
│  jane.smith@example.com                                    │
│  Admin since: Jan 10, 2026                                  │
│  [✏️ Edit] [❌ Remove Admin]                               │
└─────────────────────────────────────────────────────────────┘
[Items per page: 10 20 50]           [< 1 2 3 >]
```

## What's on the page

- Search field for admins by email or name
- "Make Admin" button → Open form to promote a user to admin
- List of admin cards:
  - Avatar with initials
  - Admin full name
  - Admin email
  - Admin since date
  - "Edit" button → Edit admin permissions/details
  - "Remove Admin" button → Remove admin privileges (requires confirmation)
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

**For admins list:**
- User id
- User first name
- User last name
- User email
- User role (admin)
- Admin since date
- User photo URL (optional)
- [Interface: `User`](../../../src/app/features/users/models/user.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/admins/paginated?page={page}&items_per_page={items_per_page}&search={search}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

**For removing admin:**
- User id
- **Backend API Endpoint:** `DELETE /api/users/{user_id}/admin`

**For making user admin:**
- User id
- **Backend API Endpoint:** `POST /api/users/{user_id}/admin`
