# Sponsor Lines List Page Schema

**Route**: `/sponsor-lines`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Sponsor Lines                          │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │  Sponsor Line Title                             │      │
│   │  Visibility: Visible/Hidden                     │      │
│   └──────────────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────────────┐      │
│   │  Sponsor Line Title                             │      │
│   │  Visibility: Visible/Hidden                     │      │
│   └──────────────────────────────────────────────────┘      │
│                                                             │
│   [Items per page: 10 20 50]  [< 1 2 3 >]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Sponsor Lines"
- List of sponsor line cards:
  - Sponsor line title
  - Visibility status (is_visible)
- Pagination controls (items per page, page navigation)

## What we need from backend

**For sponsor lines list (paginated):**
- Sponsor line id
- Sponsor line title
- Sponsor line visibility (is_visible)
- [Interface: `SponsorLine`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorLineSchema`](../../../../statsboards-backend/src/sponsor_lines/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsor_lines/paginated`
- **TODO:** Add paginated sponsor lines endpoint (only `GET /api/sponsor_lines/` exists in backend BaseRouter)

**Pagination metadata:**
- Page
- Items per page
- Total items
- Total pages
- Has next
- Has previous
- [Backend Schema: `PaginationMetadata`](../../../../statsboards-backend/src/core/schema_helpers.py)
