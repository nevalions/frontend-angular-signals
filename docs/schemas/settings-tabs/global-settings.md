# Settings - Global Settings Tab

**Tab**: Global Settings

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Seasons                                  │
│                                                             │
│  [+ Add Season]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  📅 2024                                      [Current ✓]   │
│  Description: Main season 2024                              │
│  [Edit]                                                     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📅 2023                                                   │
│  Description: Previous season 2023                          │
│  [Edit] [Set as Current]                                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📅 2025                                                   │
│  Description: Upcoming season 2025                         │
│  [Edit] [Set as Current]                                   │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page section: "Seasons"
- "Add Season" button → Open create season modal
- List of season cards:
  - Season year (e.g., 📅 2024)
  - Season description (optional)
  - "Current" indicator for the current season
  - Action buttons:
    - "Edit" → Edit season modal (year, description, iscurrent)
    - "Set as Current" → Set season as current (if not current)
  - Seasons are sorted by year (descending by default)

**Add Season Modal:**
- Year input (number, min 1900, max 2999)
- Description input (text, optional)
- "Set as Current" checkbox
- "Save" button → Create season
- "Cancel" button → Close modal without saving

**Edit Season Modal:**
- Year input (number, min 1900, max 2999)
- Description input (text, optional)
- "Set as Current" checkbox
- "Save" button → Update season
- "Cancel" button → Close modal without saving

## What we need from backend

**For seasons list:**
- Season id
- Season year
- Season description (optional)
- is_current flag
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/` (returns paginated list, all seasons)

**For creating season:**
- Season year
- Season description (optional)
- is_current flag (optional, defaults to false)
- [Interface: `SeasonSchemaCreate`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `POST /api/seasons/`

**For updating season:**
- Season id (from URL path)
- Season year (optional)
- Season description (optional)
- is_current flag (optional)
- [Interface: `SeasonSchemaUpdate`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `PUT /api/seasons/{season_id}/`
