# Tournament Teams Tab Schema

**Tab**: Teams
**Parent**: [Tournament Detail](../tournament-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search teams                                  [+ Team] │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Logo]                                             │    │
│  │  TEAM NAME                                           │    │
│  │  (CITY)                                             │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Logo]                                             │    │
│  │  TEAM NAME 2                                         │    │
│  │  (CITY 2)                                           │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Add Team Form (when toggled):**

```
┌─────────────────────────────────────────────────────────────┐
│  Select Team                                               │
│  [🔍 Search and select team to add...]                    │
│                                                            │
│                    [Add Team] [Cancel]                     │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Search input → Filter teams by name or city
- "Add Team" button → Toggle add team form / Cancel
- Add team form (when toggled):
  - Team search dropdown → Search and select team to add
  - "Add Team" button → Add selected team to tournament
  - "Cancel" button → Hide add team form
- List of team cards:
  - Team logo or avatar
  - Team name
  - Team city (optional)
  - Click to go to team detail

## What we need from backend

**For teams list:**

- Team id
- Team title
- Team city (optional)
- Team logo icon URL (optional)
- [Interface: `Team`](../../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../../statsboards-backend/src/teams/schemas.py:42-45)
- **Backend API Endpoint:** `GET /api/tournaments/id/{tournament_id}/teams/paginated`

**Query params:**

- `search`: Search by team title only (not city)
- `page`: Page number
- `items_per_page`: Items per page (max 100)
- `order_by`: Sort field
- `order_by_two`: Second sort field
- `ascending`: Sort order (true=asc, false=desc)

**For available teams dropdown (add team):**

- Team id
- Team title
- Team city (optional)
- Team logo icon URL (optional)
- [Backend Schema: `TeamSchema`](../../../../../statsboards-backend/src/teams/schemas.py:42-45)
- [Backend API Endpoint:** `GET /api/tournaments/{tournament_id}/available-teams-for-tournament`

**To add team to tournament:**

- Team id
- Tournament id
- [Backend Schema: `TeamTournamentSchemaCreate`](../../../../../statsboards-backend/src/team_tournament/schemas.py)
- **Backend API Endpoint:** `POST /api/team_in_tournament/{team_id}in{tournament_id}`
