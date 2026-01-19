# Sport EESL Parse Page Schema

**Route**: `/sports/:sportId/parse-eesl`

**Note**: Parse EESL menu item only shows in gear menu for football/soccer sports (detected by title containing "football" or "soccer")

```
┌─────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────┐
│  ← Back          Parse EESL Season            [Cancel]   │
└─────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────┐
│                                                             │
│  Select EESL season year to parse and automatically       │
│  create tournaments in the database.                             │
│                                                             │
└─────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────┐
│                                                             │
│  EESL Season Year: ▼                                      │
│                                                             │
│  [📥 Parse and Create]                                     │
│                                                             │
└─────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────┐
│                                                             │
│  Tournaments Created                                          │
│                                                             │
│  🏆 Tournament 1                                          │
│     Title: EESL Tournament Name                             │
│     EESL Year: 2024                                          │
│     ID: 1                                                   │
│                                                             │
│  🏆 Tournament 2                                          │
│     Title: Another EESL Tournament                           │
│     EESL Year: 2024                                          │
│     ID: 2                                                   │
│                                                             │
└─────────────────────────────────────────────────────┘
```

## What's on the page

- Back button → Navigate to `/sports/:sportId`
- Page title: "Parse EESL Season"
- Cancel button → Navigate to `/sports/:sportId`
- Description text explaining to feature
- Form field:
  - EESL Season Year (dropdown selector, required)
    - Populated with available years from seasons
    - Years are sorted in ascending order
- Action button:
  - "Parse and Create" button → Fetch tournaments from EESL API and create them in database in one step
  - Shows "Parsing and Creating..." while processing
  - Disabled when no year selected
- Created tournaments list:
  - Shows each tournament with title, EESL year, and EESL ID
  - Only displayed after successful parse
  - No remove/selection controls (all tournaments are created)

## What we need from backend

**For parsing and creating EESL season:**

- EESL Season Year (mapped to EESL season ID)
  - Year → EESL Season ID mapping:
    - 2021 → 1
    - 2022 → 5
    - 2023 → 7
    - 2024 → 8
    - 2025 → 9
- List of tournament data from EESL API
- Each tournament contains:
  - tournament_eesl_id
  - title
  - description (optional)
  - start_date (optional)
  - end_date (optional)
- **Backend API Endpoint:** `GET /api/tournaments/pars/season/{eesl_season_id}` (where eesl_season_id is EESL's internal season ID, NOT the calendar year)

**For saving parsed tournaments:**

- EESL Season Year
- Season ID (current season or latest season by year if no current is marked)
- Sport ID (from route parameter `:sportId`)
- List of tournaments to create
- Returns: List of created tournaments with full Tournament objects (including id)
- **Backend API Endpoint:** `POST /api/tournaments/pars_and_create/season/{eesl_season_id}?season_id={season_id}&sport_id={sport_id}` (where eesl_season_id is EESL's internal season ID, NOT calendar year)

**For sport context:**

- Sport id (from route parameter `:sportId`)
- Sport title
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/`

**For season context:**

- Season ID (current season or latest season by year if no current is marked)
- Season year
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/`

## Backend Endpoint Verification

All endpoints exist in backend:

- `GET /api/tournaments/pars/season/{eesl_season_id}` - Verified in `/statsboards-backend/src/tournaments/views.py:476`
- `POST /api/tournaments/pars_and_create/season/{eesl_season_id}` - Verified in `/statsboards-backend/src/tournaments/views.py:482`
- `GET /api/sports/id/{sport_id}/` - Standard BaseRouter endpoint
- `GET /api/seasons/` - Standard BaseRouter endpoint
