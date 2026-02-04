# Sponsors List Page Schema

**Route**: `/sponsors`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Sponsors                             │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │  Sponsor Name                                   │      │
│   │  Logo (optional)                                │      │
│   │  Logo scale (optional)                          │      │
│   └──────────────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────────────┐      │
│   │  Sponsor Name                                   │      │
│   │  Logo (optional)                                │      │
│   │  Logo scale (optional)                          │      │
│   └──────────────────────────────────────────────────┘      │
│                                                             │
│   [Items per page: 10 20 50]  [< 1 2 3 >]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Sponsors"
- List of sponsor cards:
  - Sponsor name
  - Logo (optional)
  - Logo scale (optional)
- Pagination controls (items per page, page navigation)

## What we need from backend

**For sponsors list (paginated):**
- Sponsor id
- Sponsor title
- Sponsor logo URL (optional)
- Sponsor logo scale (optional)
- [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorSchema`, `PaginatedSponsorResponse`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsors/paginated`

**Pagination metadata:**
- Page
- Items per page
- Total items
- Total pages
- Has next
- Has previous
- [Backend Schema: `PaginationMetadata`](../../../../statsboards-backend/src/core/schema_helpers.py)
