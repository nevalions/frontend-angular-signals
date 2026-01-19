# Settings - Users Tab

**Tab**: Users

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  Search users [          ]  Filter: [All ▼]  [+ Add User] │
  │                                                             │
  │  Sort by: [Name] [Email] [Online Status]                  │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │  username                         [Online] 🟢             │
  │  email@example.com                                         │
  │  Roles: user                                               │
  │  Account Status: Active 🟢                                 │
  │  Member Since: Jan 10, 2026 10:00 AM                    │
  │  Last Online: Jan 15, 2026 2:30 PM                        │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │  username2                        [Offline] ⚪            │
  │  email2@example.com                                        │
  │  Roles: user, player                                       │
  │  Account Status: Inactive 🟠                              │
  │  Member Since: Jan 5, 2026 3:00 PM                       │
  │  Last Online: Never                                        │
  └─────────────────────────────────────────────────────────────┘
                                                                 │
                      [< Prev] Page 1 of N [Next >]
  ```

## What's on the page

- Search field for users (filters by username, email, or person name)
- Filter by online status dropdown (All/Online/Offline)
- "Add User" button → Navigate to person creation page
- Sort controls:
  - Sort by Name (username) (asc/desc)
  - Sort by Email (asc/desc)
  - Sort by Online Status (asc/desc) - sorts by last_online date
- List of user cards:
  - Username
  - Online/Offline badge (Taiga UI Badge: positive/neutral)
  - Email
  - Roles list (Taiga UI Badge: primary for each role)
  - Account Status badge (Taiga UI Badge: positive for active, warning for inactive)
  - Member Since date
  - Last Online date (shows "Never" if never online)
  - Click card to navigate to user profile page
- Pagination controls
- Items per page selector (10, 20, 50)

## What we need from backend

**For users list:**
- User id
- Username
- Email
- is_active status
- Roles list
- Created (account creation date/time)
- Last online (date/time of last activity, null if never)
- Is online (boolean, true if currently online)
- Person id (optional)
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?page={page}&items_per_page={items_per_page}&order_by={order_by}&order_by_two={order_by_two}&ascending={ascending}&search={search}&role_names={role_names}&is_online={is_online}`

  - `role_names`: For users tab, filter to exclude "admin" role (e.g., `role_names=user`)
  - `is_online`: Filter by online status (true/false/null for all)
  - `order_by`: "username", "email", or "last_online"
  - `order_by_two`: "id" (second sort column)
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
