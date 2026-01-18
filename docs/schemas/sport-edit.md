# Sport Edit Page Schema

**Route**: `/sports/:id/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Edit Sport                                  [Cancel] [Save]│
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Title *                                                   │
│  [Current sport title]                                     │
│                                                             │
│  Description                                               │
│  [Current sport description]                               │
│  [                                                  ]       │
│  [                                                  ]       │
│  [                                                  ]       │
│  [                                                  ]       │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Sport"
- "Cancel" button → Navigate back to `/sports/:id` (sport detail)
- "Save Changes" button → Submit form
- Form with:
  - Title field (required, pre-filled)
  - Description field (optional, pre-filled, 4 rows)

## What we need from backend

**To get sport details:**
- Sport id
- Sport title
- Sport description (optional)
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/`

**To update sport:**
- Sport title
- Sport description (optional)
- [Interface: `SportUpdate`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchemaUpdate`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `PUT /api/sports/{item_id}/`

**To delete sport:**
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- **Backend API Endpoint:** `DELETE /api/sports/id/{sport_id}` (from BaseRouter)

