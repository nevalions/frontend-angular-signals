# Settings Page Schema

**Route**: `/settings`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│ │                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Settings                              │
└─────────────────────────────────────────────────────────────┘
                                                               │
 ┌─────────────────────────────────────────────────────────────┐
    │  [Dashboard] [Users] [Roles] [Global Settings]              │
  └─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Tab Content Here                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Entity header with:
  - Back button → Navigate to `/home` or previous page
  - Page title: "Settings"
  - No gear/settings button (unlike sport-detail, tournament-detail)
- Tab navigation: Dashboard (default), Users, Roles, Global Settings
- Tab content area → Shows content for selected tab (defaults to Dashboard)

## What we need from backend

**No backend data needed for main settings page header** - tabs fetch their own data.
