# Settings - Dashboard Tab

**Tab**: Dashboard (Default/First Tab)

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard Overview                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  👥 Users Online                                            │
│  ─────────────────────────────────────────────────────────  │
│  [🟢] username1        Last activity: 2 min ago              │
│  [🟢] username2        Last activity: 5 min ago              │
│  [🟢] username3        Last activity: 8 min ago              │
│  [🟢] username4        Last activity: 12 min ago             │
│  [🟢] username5        Last activity: 15 min ago             │
│                                                             │
│  [View All Users →]                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  👨‍💼 Admins Online                                           │
│  ─────────────────────────────────────────────────────────  │
│  [🟢] admin1          Last activity: 1 min ago               │
│  [🟢] admin2          Last activity: 3 min ago               │
│  [🟢] admin3          Last activity: 7 min ago               │
│  [🟢] admin4          Last activity: 10 min ago              │
│  [🟢] admin5          Last activity: 14 min ago              │
│                                                             │
│  [View All Admins →]                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🆕 Recently Registered Users                                │
│  ─────────────────────────────────────────────────────────  │
│  username6        Joined: Jan 18, 2026  3:45 PM             │
│  username7        Joined: Jan 18, 2026  2:30 PM             │
│  username8        Joined: Jan 18, 2026  1:15 PM             │
│  username9        Joined: Jan 17, 2026 11:00 AM             │
│  username10       Joined: Jan 17, 2026  9:30 AM             │
│                                                             │
│  [View All Users →]                                        │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Dashboard overview section with title "📊 Dashboard Overview"
- **Users Online** section (max 5):
  - List of currently online users with online indicator (🟢)
  - Username
  - Last activity timestamp (relative time, e.g., "2 min ago")
  - "View All Users →" button → Navigate to Users tab
- **Admins Online** section (max 5):
  - List of currently online admins with online indicator (🟢)
  - Username
  - Last activity timestamp
  - "View All Admins →" button → Navigate to Admins tab
- **Recently Registered Users** section (max 5):
  - List of 5 most recently registered users
  - Username
  - Account creation timestamp (full date/time)
  - "View All Users →" button → Navigate to Users tab

## What we need from backend

**For users online list (max 5):**
- User id
- Username
- Is online (boolean)
- Last online timestamp
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?is_online=true&items_per_page=5&order_by=last_online&order_by_two=created&ascending=false`

**For admins online list (max 5):**
- User id
- Username
- Is online (boolean)
- Last online timestamp
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?is_online=true&role_names=admin&items_per_page=5&order_by=last_online&order_by_two=created&ascending=false`

**For recently registered users (max 5):**
- User id
- Username
- Created timestamp
- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)
- **Backend API Endpoint:** `GET /api/users/search?items_per_page=5&order_by=created&order_by_two=username&ascending=false`
