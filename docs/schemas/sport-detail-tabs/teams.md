# Sport Detail - Teams Tab

**Tab**: Teams

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
<<<<<<< HEAD
                                                              │
[Items per page: 10 20 50]           [< 1 2 3 >]
=======
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead
```

## What's on the page

- Search field for teams
<<<<<<< HEAD
- "Add Team" button
=======
- "Add Team" button → Navigate to [Team Create](../../team-create.md)
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead
- List of team cards:
  - Team logo or avatar with initials
  - Team name
  - City (optional)
  - Click to go to team detail
<<<<<<< HEAD
- Items per page selector (10, 20, 50)
- Pagination controls
=======
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead

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
