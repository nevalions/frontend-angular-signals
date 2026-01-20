# Events Tab Schema

**Tab**: Events
**Parent**: [Match Detail](../match-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search events           [+ Add Event]    [✏️ Edit]    │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Q1  [12:00]  Touchdown  Team A       #84 Mike Johnson    │
│  Q1  [08:45]  Interception  Team B    #7 Alex Brown       │
│  Q1  [04:20]  Field Goal  Team A      #99 John Smith      │
│  Q2  [10:30]  Fumble  Team B         #11 Tom Davis       │
│  Q2  [02:15]  Touchdown  Team B       #88 Jake Miller    │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Search input → Filter events by type, team, or player
- "Add Event" button → Show form to add event
- "Edit" button → Toggle inline edit mode for all events
- Timeline list of events:
  - Quarter and timestamp (e.g., "Q1 [12:00]")
  - Event type (e.g., Touchdown, Interception, Field Goal, Fumble, etc.)
  - Team (Team A or Team B)
  - Player number and name (if applicable)
  - Edit button → Open event edit dialog
  - Delete button → Confirm and remove event
- Events sorted by quarter and timestamp (most recent first)

## What we need from backend

**For events list:**

- Football event id
- Match id
- Quarter
- Timestamp
- Event type
- Team id
- Player match id (if applicable)
- Event details (yards, points, etc.)
- [Interface: `FootballEvent`](../../../../src/app/features/matches/models/football-event.model.ts)
- [Backend Schema: `FootballEventSchema`](../../../../../statsboards-backend/src/football_events/schemas.py)
- **Backend API Endpoint:** `GET /api/football_event/matches/{match_id}/events-with-players/`

**For adding event:**

- Match id
- Quarter
- Timestamp
- Event type
- Team id
- Player match id (if applicable)
- Event details
- [Interface: `FootballEventCreate`](../../../../src/app/features/matches/models/football-event.model.ts)
- [Backend Schema: `FootballEventSchemaCreate`](../../../../../statsboards-backend/src/football_events/schemas.py)
- **Backend API Endpoint:** `POST /api/football_event/`

**For updating event:**

- Event id
- Updated quarter, timestamp, event type, team id, player match id, event details
- [Interface: `FootballEventUpdate`](../../../../src/app/features/matches/models/football-event.model.ts)
- [Backend Schema: `FootballEventSchemaUpdate`](../../../../../statsboards-backend/src/football_events/schemas.py)
- **Backend API Endpoint:** `PUT /api/football_event/id/{event_id}/`

**For deleting event:**

- Event id
- **Backend API Endpoint:** `DELETE /api/football_event/id/{event_id}/`
