# Sport Detail - Teams Tab

**Tab**: Teams
**Parent**: [Sport Detail](../sport-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search teams                 [+ Add Team]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]                                                    │
│  TEAM NAME 1                                               │
│  CITY (optional)                                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]                                                    │
│  TEAM NAME 2                                               │
  │  CITY (optional)                                           │
└─────────────────────────────────────────────────────────────┘
[Items per page: 10 20 50]           [< 1 2 3 >]
```

## What's on the tab

- Search field for teams
- "Add Team" button → Navigate to [Team Create](../../team-create.md)
- List of team cards:
  - Team logo or avatar with initials
  - Team name
  - City (optional)
  - Click to go to team detail
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

**For teams list:**
- Team id
- Team title
- Team city (optional)
- Team logo URL (optional)
- [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/teams/paginated`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
