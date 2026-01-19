# Settings - Users Tab

**Tab**: Users

 ```
 ┌─────────────────────────────────────────────────────────────┐
 │  john_doe                        [Online] 🟢           │
 │  john.doe@example.com                                      │
 │  Roles: user                                              │
 │  Account Status: Active 🟢                                 │
 │  Member Since: Jan 15, 2026 10:00 AM                    │
 │  Last Online: Jan 19, 2026 2:30 PM                        │
 └─────────────────────────────────────────────────────────────┘
 ┌─────────────────────────────────────────────────────────────┐
 │  jane_smith                       [Offline] ⚪           │
 │  jane.smith@example.com                                    │
 │  Roles: admin                                             │
 │  Account Status: Active 🟢                                 │
 │  Member Since: Jan 10, 2026 3:00 PM                       │
 │  Last Online: Never                                        │
 └─────────────────────────────────────────────────────────────┘
 [Items per page: 10 20 50]           [< 1 2 3 >]
 ```

## What's on the page

- Search field for users by username, email, or person name
- "Add User" button → Navigate to user creation page
- List of user cards:
  - Username
  - Online/Offline badge (Taiga UI Badge: positive/neutral)
  - User email
  - Roles list (Taiga UI Badge: primary for each role)
  - Account Status badge (Taiga UI Badge: positive for active, warning for inactive)
  - Member Since date
  - Last Online date (shows "Never" if never online)
  - Click card to navigate to user profile page
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

**For users list:**
- User id
- Username
- Email
- User roles list (array of role names)
- User creation date (created)
- Last online date (last_online, null if never)
- Is online status (is_online, boolean)
- Is active status (is_active, boolean)
- Person id (optional)
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?page={page}&items_per_page={items_per_page}&order_by={order_by}&order_by_two={order_by_two}&ascending={ascending}&search={search}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
