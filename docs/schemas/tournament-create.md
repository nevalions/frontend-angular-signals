# Tournament Create Page Schema

**Route**: `/tournaments/create`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Create Tournament                          [Cancel] [Save] │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Title *                                                   │
│  [Tournament title]                                       │
│                                                             │
 │  Description                                               │
 │  [Tournament description]                                 │
 │  [                                                  ]       │
 │  [                                                  ]       │
 │  [                                                  ]       │
 │  [                                                  ]       │
 │                                                             │
  │  Logo                                                      │
  │  [Choose file...]                                           │
  │  [Original] [Icon] [Web View]                            │
  │                                                             │
  │  EESL ID                                                   │
  │  [Enter EESL ID (optional)]                              │
  │                                                             │
  │  Main Sponsor                                              │
  │  [Select Main Sponsor ▼]                                  │
  │                                                             │
  │  Sponsor Line                                              │
  │  [Select Sponsor Line ▼]                                  │

└─────────────────────────────────────────────────────────────┘
```

## What's on the page

 - Page title: "Create Tournament"
 - "Cancel" button → Navigate back to previous page or `/home`
 - "Save" button → Submit form
  - Form with:
    - Title field (required)
    - Description field (optional, 4 rows)
    - Logo (optional) - File upload with preview showing Original, Icon, Web View
    - EESL ID field (optional)
    - Main Sponsor dropdown (optional) - Taiga UI select with sponsor titles
    - Sponsor Line dropdown (optional) - Taiga UI select with sponsor line titles
    - Season dropdown (required)
    - Sport dropdown (required)


## What we need from backend

  **To create tournament:**
  - Tournament title
  - Tournament description (optional)
  - Tournament logo URLs (optional) - from file upload
    - Original URL
    - Icon URL
    - Web View URL
  - Tournament EESL ID (optional)
  - Main sponsor id (optional)
  - Sponsor line id (optional)
  - Season id
  - Sport id
  - [Interface: `TournamentCreate`](../../../src/app/features/tournaments/models/tournament.model.ts)
  - [Backend Schema: `TournamentSchemaCreate`](../../../../statsboards-backend/src/tournaments/schemas.py)
  - **Backend API Endpoint:** `POST /api/tournaments/`
  - **Backend File Upload Endpoint:** `POST /api/tournaments/upload_resize_logo` (optional)


**For seasons dropdown:**
- Season id
- Season year
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/paginated`

 **For sports dropdown:**
 - Sport id
 - Sport title
 - [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
 - [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
 - **Backend API Endpoint:** `GET /api/sports/`

 **For main sponsor dropdown:**
 - Sponsor id
 - Sponsor title
 - [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
 - [Backend Schema: `SponsorSchema`](../../../../statsboards-backend/src/sponsors/schemas.py)
 - **Backend API Endpoint:** `GET /api/sponsors/`

 **For sponsor line dropdown:**
 - Sponsor line id
 - Sponsor line title
 - [Interface: `SponsorLine`](../../../src/app/features/sponsors/models/sponsor-line.model.ts)
 - [Backend Schema: `SponsorLineSchema`](../../../../statsboards-backend/src/sponsors/schemas.py)
 - **Backend API Endpoint:** `GET /api/sponsor_lines/paginated`

