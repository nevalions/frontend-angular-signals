# Sports List Page Schema

**Route**: `/sports`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Sports                               │
│                                                             │
│   ┌──────────────────────────────────────────────────┐    │
│   │                                                  │    │
│   │  Sport Name 1                                   │    │
│   │  Description (optional)                         │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────────────┐    │
│   │                                                  │    │
│   │  Sport Name 2                                   │    │
│   │  Description (optional)                         │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────────────┐    │
│   │                                                  │    │
│   │  Sport Name 3                                   │    │
│   │  Description (optional)                         │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Sports"
- List of sport cards:
  - Sport name
  - Description (optional)
  - Click to go to sport detail

## What we need from backend

**For sports list:**
- Sport id
- Sport title
- Sport description (optional)
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/`
<<<<<<< HEAD
- **TODO:** Need paginated endpoint for sports list

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
=======
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead
