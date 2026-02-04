# Sponsor Detail Page Schema

**Route**: `/sponsors/:id`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                             
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Sponsor Name           [Edit] [Delete]│
└─────────────────────────────────────────────────────────────┘
                                                             
┌─────────────────────────────────────────────────────────────┐
│  Details                                                    │
│                                                             │
│  Logo:                                                      │
│  ┌──────────────┐                                          │
│  │              │                                          │
│  │   [Logo]     │                                          │
│  │              │                                          │
│  └──────────────┘                                          │
│                                                             │
│  Sponsor Title: [Title]                                    │
│  Logo Scale: [Scale]                                       │
│  Sponsor Lines: [Line badges]                              │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Entity header with:
  - Back button → Navigate to sponsors list
  - Sponsor title
  - Edit/Delete gear menu
- Details section:
  - Logo preview (optional)
  - Sponsor title
  - Logo scale (optional)
  - Sponsor lines connection badges

## What we need from backend

**For sponsor details:**
- Sponsor id
- Sponsor title
- Sponsor logo URL (optional)
- Sponsor logo scale (optional)
- [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorSchema`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsors/id/{item_id}/`

**For sponsor lines lookup:**
- Sponsor line id
- Sponsor line title
- [Interface: `SponsorLine`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorLineSchema`](../../../../statsboards-backend/src/sponsor_lines/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_lines/paginated`

**For sponsor-line connections:**
- Sponsor id
- Sponsor line id
- [Backend Schema: `SponsorSponsorLineSchema`](../../../../statsboards-backend/src/sponsor_sponsor_line_connection/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_in_sponsor_line/sponsor_line/id/{sponsor_line_id}/sponsors`
