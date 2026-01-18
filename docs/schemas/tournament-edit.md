# Tournament Edit Page Schema

**Route**: `/sports/:sportId/seasons/:year/tournaments/:id/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Edit Tournament                          [Cancel] [Save] │
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
│  Season *                                                  │
│  [Select season ▼]                                        │
│                                                             │
│  Sport *                                                   │
│  [Select sport ▼]                                         │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Tournament"
- "Cancel" button → Navigate to tournament detail
- "Save" button → Submit form
 - Form with:
   - Title field (required, pre-filled)
   - Description field (optional, 4 rows, pre-filled)
   - Logo (optional, pre-filled) - File upload with preview showing Original, Icon, Web View
   - Season dropdown (required, pre-filled)
   - Sport dropdown (required, pre-filled)

## What we need from backend

 **To get tournament data for editing:**
 - Tournament id
 - Tournament title
 - Tournament description (optional)
 - Tournament logo URLs (optional)
   - Original URL
   - Icon URL
   - Web View URL
 - Season id
 - Sport id
 - [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
 - [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
 - **Backend API Endpoint:** `GET /api/tournaments/id/{tournament_id}/`

 **To update tournament:**
 - Tournament id
 - Tournament title
 - Tournament description (optional)
 - Tournament logo URLs (optional) - from file upload
   - Original URL
   - Icon URL
   - Web View URL
 - Season id
 - Sport id
 - [Interface: `TournamentUpdate`](../../../src/app/features/tournaments/models/tournament.model.ts)
 - [Backend Schema: `TournamentSchemaUpdate`](../../../../statsboards-backend/src/tournaments/schemas.py)
 - **Backend API Endpoint:** `PUT /api/tournaments/id/{tournament_id}/`
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
