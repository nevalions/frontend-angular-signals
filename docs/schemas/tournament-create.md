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
│  Logo Icon URL                                             │
│  [https://example.com/logo.png]                            │
│                                                             │
│  Season *                                                  │
│  [Select season ▼]                                        │
│                                                             │
│  Sport *                                                   │
│  [Select sport ▼]                                         │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create Tournament"
- "Cancel" and "Save" buttons
- Form with:
  - Title field (required)
  - Description field (optional, 4 rows)
  - Logo icon URL field (optional)
  - Season dropdown (required)
  - Sport dropdown (required)

## What we need from backend

**To create tournament:**
- Tournament title
- Tournament description (optional)
- Tournament logo icon URL (optional)
- Season id
- Sport id
- [Interface: `TournamentCreate`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchemaCreate`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `POST /api/tournaments/`

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
