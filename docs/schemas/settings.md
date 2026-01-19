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
│  [Users] [Admins] [Global Settings]                         │
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
- Tab navigation: Users, Admins, Global Settings
- Tab content area → Shows content for selected tab

## What we need from backend

**No backend data needed for main settings page header** - tabs fetch their own data.
