# Settings - Roles Tab

**Tab**: Roles
**Parent**: [Settings](../settings.md)

```
┌─────────────────────────────────────────────────────────────┐
│  Roles        🔍 Search roles...          [+ Add Role]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                                 │
┌─────────────────────────────────────────────────────────────┐
│  admin                                                      │
│  Description: Administrators with full system access        │
│  [✏️ Edit] [❌ Delete]                                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  user                                                       │
│  Description: Standard user with limited access             │
│  [✏️ Edit] [❌ Delete]                                      │
└─────────────────────────────────────────────────────────────┘
[Items per page: 10 20 50]           [< 1 2 3 >]

┌─────────────────────────────────────────────────────────────┐
│  Users        🔍 Search users...                          │
│              Filter by: [Role ▼] [Online ▼]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  john_doe                        [Online] 🟢           │
│  john.doe@example.com                                      │
│  Roles: user, mod                                           │
│  Account Status: Active 🟢                                 │
│  Member Since: Jan 15, 2026 10:00 AM                       │
│  Last Online: Jan 19, 2026 2:30 PM                          │
│  [+ Add Role]                                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  jane_smith                       [Offline] ⚪           │
│  jane.smith@example.com                                     │
│  Roles: admin                                               │
│  Account Status: Active 🟢                                 │
│  Member Since: Jan 10, 2026 3:00 PM                         │
│  Last Online: Never                                          │
│  [+ Add Role]                                               │
└─────────────────────────────────────────────────────────────┘
[Items per page: 10 20 50]           [< 1 2 3 >]
```

## What's on the tab

### Roles Section (Top)
- Search field for roles by name or description
- "Add Role" button → Open form to create a new role
- List of role cards:
  - Role name (title)
  - Role description
  - "Edit" button → Edit role name and description
  - "Delete" button → Delete role (requires confirmation)
- Items per page selector (10, 20, 50)
- Pagination controls
- **Roles sorted by title (name)**

### Users Section (Bottom)
- "Users" title
- Search field for users by username, email, or person name (on same line as title)
- Filter by role dropdown (select from available roles, on new line centered)
- Filter by online status dropdown (All/Online/Offline)
- List of user cards:
  - Username
  - Online/Offline badge (Taiga UI Badge: positive/neutral)
  - User email
  - Roles list (Taiga UI Badge: primary for each role)
  - Account Status badge (Taiga UI Badge: positive for active, warning for inactive)
  - Member Since date
  - Last Online date (shows "Never" if never online)
  - "Add Role" button → Open dialog to add a role to this user
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

### For roles list:
- Role id
- Role name (title)
- Role description
- [Interface: `RoleList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `RoleSchema`](../../../../statsboards-backend/src/roles/schemas.py)
- **Backend API Endpoint:** `GET /api/roles/paginated?page={page}&items_per_page={items_per_page}&search={search}&order_by={order_by}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

**For creating role:**
- Role name
- Role description (optional)
- **Backend API Endpoint:** `POST /api/roles`

**For updating role:**
- Role id
- Role name (optional)
- Role description (optional)
- **Backend API Endpoint:** `PATCH /api/roles/{role_id}`

**For deleting role:**
- Role id
- **Backend API Endpoint:** `DELETE /api/roles/{role_id}`

### For users list:
- User id
- Username
- Email
- User roles list (array of role objects with id and name)
- User creation date (created)
- Last online date (last_online, null if never)
- Is online status (is_online, boolean)
- Is active status (is_active, boolean)
- Person id (optional)
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?page={page}&items_per_page={items_per_page}&order_by={order_by}&order_by_two={order_by_two}&ascending={ascending}&search={search}&role_id={role_id}&is_online={is_online}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

### For adding role to user:
- User id
- Role id
- **Backend API Endpoint:** `POST /api/users/{user_id}/roles`
