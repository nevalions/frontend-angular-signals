# Sport EESL Parse Page Schema

**Route**: `/sports/:sportId/parse-eesl`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────────────┐
│  ← Back          Parse EESL Season            [Cancel]   │
└─────────────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Parse tournaments from EESL API and import them           │
│  into the database.                                         │
│                                                             │
│  EESL Season ID _                                          │
│  [_________________]                                         │
│                                                             │
│  [🔍 Parse]  [💾 Save All]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Parsed Tournaments                                         │
│                                                             │
│  📦 Tournament 1                       [❌]                 │
│     Title: EESL Tournament Name                             │
│     EESL ID: 12345                                          │
│                                                             │
│  📦 Tournament 2                       [❌]                 │
│     Title: Another EESL Tournament                           │
│     EESL ID: 67890                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Back button → Navigate back to `/sports/:sportId`
- Page title: "Parse EESL Season"
- Cancel button → Navigate back to `/sports/:sportId`
- Description text explaining the feature
- Form field:
  - EESL Season ID (number input, required)
- Action buttons:
  - "Parse" button → Fetch tournaments from EESL API
  - "Save All" button → Save all parsed tournaments to database
- Parsed tournaments list:
  - Shows each tournament with title and EESL ID
  - Each tournament has a remove button to exclude from import
  - Only displayed after successful parse

## What we need from backend

**For parsing EESL season:**

- EESL Season ID
- List of tournament data from EESL API
- Each tournament contains:
  - tournament_eesl_id
  - title
  - description (optional)
  - start_date (optional)
  - end_date (optional)
- **Backend API Endpoint:** `GET /api/tournaments/pars/season/{eesl_season_id}`

**For saving parsed tournaments:**

- EESL Season ID
- Season ID (from route parameter `:sportId`)
- Sport ID (from route parameter `:sportId`)
- List of tournaments to create
- Returns: List of created tournaments
- **Backend API Endpoint:** `POST /api/tournaments/pars_and_create/season/{eesl_season_id}?season_id={season_id}&sport_id={sport_id}`

**For sport context:**

- Sport id (from route parameter `:sportId`)
- Sport title
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/`

## Backend Endpoint Verification

All endpoints exist in backend:

- `GET /api/tournaments/pars/season/{eesl_season_id}` - Verified in `/statsboards-backend/src/tournaments/views.py:476`
- `POST /api/tournaments/pars_and_create/season/{eesl_season_id}` - Verified in `/statsboards-backend/src/tournaments/views.py:482`
- `GET /api/sports/id/{sport_id}/` - Standard BaseRouter endpoint
