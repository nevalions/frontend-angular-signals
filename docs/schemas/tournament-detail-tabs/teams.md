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
- [Backend Schema: `TeamSchema`](../../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `GET /api/teams/tournament/{tournament_id}/paginated`

**Query params:**

- `search`: Search by name or city
  **TODO** check if it search and city also or only team title
- `page`: Page number
- `page_size`: Items per page

**For available teams dropdown (add team):**

- Team id
- Team title
- Team city (optional)
- Team logo icon URL (optional)
  **TODO** check interface
- [Backend API Endpoint:\*\* `GET /api/teams/sport/{sport_id}/available-for-tournament/{tournament_id}`

**To add team to tournament:**

- Team id
- Tournament id
- [Backend Schema: `TournamentTeamSchemaCreate`](../../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `POST /api/tournaments/{tournament_id}/teams/`

## TODO

- Verify backend endpoint exists for available teams for tournament
- Verify backend endpoint exists for adding team to tournament
