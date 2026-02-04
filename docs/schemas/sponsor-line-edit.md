# Sponsor Line Edit Page Schema

**Route**: `/sponsor-lines/:id/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Edit Sponsor Line                            [Cancel] [Save]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Sponsor Line Title *                                        │
│  [_____________________________]                             │
│                                                             │
│  Visibility                                                  │
│  [ ] Visible on sponsor line                                 │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Sponsor Line"
- "Cancel" and "Save" buttons
- Form fields:
  - Sponsor line title (required)
  - Visibility toggle (is_visible)

## What we need from backend

**For sponsor line details (populate form):**
- Sponsor line id
- Sponsor line title
- Sponsor line visibility (is_visible)
- [Interface: `SponsorLine`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorLineSchema`](../../../../statsboards-backend/src/sponsor_lines/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_lines/id/{item_id}/`

**For updating sponsor line:**
- Sponsor line title (required)
- Sponsor line visibility (optional)
- [Interface: `SponsorLineUpdate`](../../../src/app/features/sponsors/models/sponsor-line.model.ts)
- [Backend Schema: `SponsorLineSchemaUpdate`](../../../../statsboards-backend/src/sponsor_lines/schemas.py)
- **Backend API Endpoint:** `PUT /api/sponsor_lines/{item_id}/`
