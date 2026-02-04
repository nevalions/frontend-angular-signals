# Sponsor Line Detail Page Schema

**Route**: `/sponsor-lines/:id`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ← Back             Sponsor Line Title         [Edit] [Delete]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Details                                                    │
│                                                             │
│  Sponsor Line Title: [Title]                                │
│  Visibility: [Visible/Hidden]                               │
│  Sponsors: [Sponsor badges]                                 │
│                                                             │
│  Manage Sponsors                                            │
│  [Multi-select sponsors]                                    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Entity header with:
  - Back button → Navigate to sponsor lines list
  - Sponsor line title
  - Edit/Delete gear menu
- Details section:
  - Sponsor line title
  - Visibility status (is_visible)
  - Connected sponsors badges
  - Sponsors selector (multi-select to add/remove)

## What we need from backend

**For sponsor line details:**
- Sponsor line id
- Sponsor line title
- Sponsor line visibility (is_visible)
- [Interface: `SponsorLine`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorLineSchema`](../../../../statsboards-backend/src/sponsor_lines/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_lines/id/{item_id}/`

**For sponsor-line connections (sponsors in line):**
- Sponsor line id
- Sponsor id
- Sponsor title
- Sponsor position (optional)
- [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorSponsorLineSchema`](../../../../statsboards-backend/src/sponsor_sponsor_line_connection/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_in_sponsor_line/sponsor_line/id/{sponsor_line_id}/sponsors`

**For sponsor selector list:**
- Sponsor id
- Sponsor title
- [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorSchema`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsors/`

**For sponsor-line connection updates:**
- Sponsor id
- Sponsor line id
- [Backend Schema: `SponsorSponsorLineSchemaCreate`](../../../../statsboards-backend/src/sponsor_sponsor_line_connection/schemas.py)
- **Backend API Endpoint:** `POST /api/sponsor_in_sponsor_line/{sponsor_id}in{sponsor_line_id}`
- **Backend API Endpoint:** `DELETE /api/sponsor_in_sponsor_line/{sponsor_id}in{sponsor_line_id}`
