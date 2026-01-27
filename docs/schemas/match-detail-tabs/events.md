# Events Tab Schema

**Tab**: Events
**Parent**: [Match Detail](../match-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Match Events                    Play-by-play timeline   │
│                                                               │
│  [All | Q1 | Q2 | Q3 | Q4 | OT]                              │
│                                                               │
│  Total Plays: 12 | Pass: 5 | Run: 4 | Scoring: 3           │
└─────────────────────────────────────────────────────────────┘
                                                                 │
┌─────────────────────────────────────────────────────────────┐
│  ╞═══════════════════════════════════════════════════╡   │
│  🚩 Quarter 1                                             │
│  ╞═══════════════════════════════════════════════════╡   │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ #1      ─────►  1st & 10                 │          │
│  │                  📤 Pass                  │          │
│  │                  ✅ Complete              │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ #2      ─────►  1st & 10                 │          │
│  │                  📤 Pass                  │          │
│  │                  ❌ Incomplete             │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  ╞═══════════════════════════════════════════════════╡   │
│  🚩 Quarter 2                                             │
│  ╞═══════════════════════════════════════════════════╡   │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ #3      ─────►  2nd & 7                  │          │
│  │                  📈 Rush                  │          │
│  │                  🏆 Touchdown!           │          │
│  │                  ⭐ +7 pts                │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ #4      ─────►  1st & 10                 │          │
│  │                  📤 Pass                  │          │
│  │                  🛡️ Interception          │          │
│  └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

### Header Section
- Match Events title with "Play-by-play timeline" subtitle
- Quarter filter tabs (All, Q1, Q2, Q3, Q4, OT) - filter events by quarter
- Stats summary showing:
  - Total plays count
  - Pass plays count
  - Run plays count
  - Scoring plays count

### Timeline View
- Vertical timeline with quarter markers
- Each event card shows:
  - Event number
  - Down and distance (e.g., "1st & 10" or "Special Play")
  - Play type with icon (Pass, Rush, Kick, etc.)
  - Play result badge (Complete, Incomplete, Touchdown, Interception, etc.)
  - Scoring plays highlighted with trophy icon and points
  - Turnover plays highlighted with alert styling
- Events sorted chronologically
- Visual connectors between events
- Quarter divider markers with flag icon

 ### Empty State
- No Events Recorded message when no events available

## Real-time Updates (WebSocket)

**Events Timeline Updates:**

- Events timeline updates automatically via WebSocket (no page refresh needed)
- Parent component (MatchDetailComponent) updates `comprehensiveData.events` signal
- Tab receives updates via `@Input()` and reflects changes instantly
- New events appear at correct chronological position

**Update Types:**

- **New event added**: Event appears in timeline immediately (at correct position)
- **Event modified**: Event details update in place (e.g., corrected yardage)
- **Events reordered**: Timeline re-sorts chronologically (if backend reorders)
- **Multiple events added**: All events appear, maintaining order

**WebSocket Signal:**

- `eventsPartial` → Complete events array replacement (not partial updates)
- Effect compares `JSON.stringify(current.events)` vs `JSON.stringify(newEvents)` to avoid unnecessary re-renders
- Updates arrive via `match-update` messages containing full events array

**Event Types That Trigger Stats Updates:**

- **Touchdown** → Updates points, yards, QB stats, offense stats
- **Field goal** → Updates points
- **Penalty** → Updates penalty yards
- **Turnover** → Updates turnovers, defense stats
- **Pass completion** → Updates pass stats, QB stats
- **Run play** → Updates rush stats
- **Sack** → Updates defense stats

**Performance:**

- Deep equality check prevents unnecessary re-renders
- Full array replacement ensures no stale data
- Signals ensure automatic UI refresh
- Timeline sorting updates automatically

## What we need from backend

**For events list:**

- Football event id
- Event number
- Match id
- Quarter (event_qtr)
- Down (event_down)
- Distance (event_distance)
- Play type (play_type)
- Play result (play_result)
- Score result (score_result)
- [Interface: `FootballEvent`](../../../../src/app/features/matches/models/football-event.model.ts)
- [Backend Schema: `FootballEventSchema`](../../../../../statsboards-backend/src/football_events/schemas.py)
- **Backend API Endpoint:** Events are part of `ComprehensiveMatchData` loaded via match detail endpoint

**For match data:**

- Match data is loaded as part of `ComprehensiveMatchData` from parent component
- [Interface: `ComprehensiveMatchData`](../../../../src/app/features/matches/models/comprehensive-match.model.ts)
- See [Match Detail Schema](../match-detail.md) for full API endpoint details
