# Team Create Page Schema

**Route**: `/sports/:sportId/teams/new`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Create New Team                                   [Cancel] [Create]│
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Title *                                                   │
│  [_____________________________]                              │
│                                                             │
│  City                                                      │
│  [Enter city (optional)]                                    │
│                                                             │
│  Team Color *                                             │
│  [🎨 #DA291C] [#DA291C]                              │
│                                                             │
│  Description                                               │
│  [Enter a description for team (optional)]             │
│  [                                                  ]       │
│  [                                                  ]       │
│  [                                                  ]       │
│                                                             │
│  EESL ID                                                   │
│  [Enter EESL ID (optional)]                                │
│                                                             │
│  Team Logo                                                  │
│  [Choose file...]                                           │
│  [Original] [Icon] [Web View]                            │
│                                                             │
│  Sponsor Line ID                                            │
│  [Enter sponsor line ID (optional)]                           │
│                                                             │
│  Main Sponsor ID                                            │
│  [Enter main sponsor ID (optional)]                           │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create New Team"
- "Cancel" button → Navigate back to teams list
- "Create Team" button → Submit form
- Form fields:
  - Title (required)
  - City (optional)
  - Team color (required) - Color picker + text input for hex value
  - Description (optional, 4 rows)
  - EESL ID (optional)
  - Team logo (optional) - File upload with preview showing Original, Icon, Web View
  - Sponsor Line ID (optional)
  - Main Sponsor ID (optional)

## What we need from backend

**For creating team:**
- Title (required)
- City (optional)
- Team color (required)
- Description (optional)
- Team EESL ID (optional)
- Sport ID (from route parameter `:sportId`)
- Team logo URLs (optional) - from file upload
  - Original URL
  - Icon URL
  - Web View URL
- Sponsor Line ID (optional)
- Main Sponsor ID (optional)
- [Interface: `TeamCreate`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchemaCreate`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `POST /api/teams/`
- **Backend File Upload Endpoint:** `POST /api/teams/upload_resize_logo` (optional)
