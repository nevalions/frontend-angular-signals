# Tournament Matches Tab Schema

**Tab**: Matches
**Parent**: [Tournament Detail](../tournament-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search matches         📅 Week  [x]  [+ Add Match]   │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  [⬆️⬇️] Sort by Week, Date                                 │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐    │
│  │ Week 1 • Jan 15, 2025                              │    │
│  │                                                      │    │
│  │  [Logo] TEAM A    vs    [Logo] TEAM B              │    │
│  │                                                      │    │
│  │  EESL ID: 12345                                     │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Week 2 • Jan 22, 2025                              │    │
│  │                                                      │    │
│  │  [Logo] TEAM C    vs    [Logo] TEAM D              │    │
│  │                                                      │    │
│  │  EESL ID: 12346                                     │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Items per page: [10] [25] [50]                    1/5     │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Search input → Filter matches by team name
- Week filter → Filter matches by week number
- "Add Match" button → Navigate to match create page
- Sort button → Toggle sort order (Week, Date)
- List of match cards:
  - Week number (if available)
  - Match date
  - Team A logo and name
  - Team B logo and name
  - Match EESL ID (if available)
  - Click to go to match detail
- Pagination controls
- Items per page selector

## What we need from backend

**For matches list:**

- Match id
- Match week (optional)
- Match date
- Team A (id, title, logo icon URL)
- Team B (id, title, logo icon URL)
- Match EESL ID (optional)
- Tournament id
- [Interface: `MatchWithDetails`](../../../../src/app/features/matches/models/match.model.ts)
- [Backend Schema: `MatchWithDetailsSchema`](../../../../../statsboards-backend/src/matches/schemas.py:113-116)
- **Backend API Endpoint:** `GET /api/matches/with-details/paginated`

**Query params:**

- `search`: Search by match_eesl_id
- `week`: Filter by week number
- `tournament_id`: Filter by tournament id
- `page`: Page number
- `items_per_page`: Items per page (max 100)
- `order_by`: Sort field (match_date, id, etc.)
- `ascending`: Sort order (true=asc, false=desc)

**For creating match:**

- `POST /api/matches/` - Creates a basic match
- `POST /api/matches/create_with_full_data/` - Creates match with match_data, playclock, gameclock, and scoreboard
- `POST /api/matches/add` - Creates match with full data and scoreboard
- [Backend Schema: `MatchSchemaCreate`](../../../../../statsboards-backend/src/matches/schemas.py:27-33)
