# Sport Create Page Schema

**Route**: `/sports/new`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Create Sport                               [Cancel] [Create]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Sport Title *                                               │
│ [_____________________________]                             │
│                                                             │
│ Description (optional)                                      │
│ [_____________________________]                             │
│                                                             │
│ Scoreboard Preset (optional)                                │
│ [None v]                                                    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create Sport"
- "Cancel" button -> Navigate back to sports list
- "Create" button -> Submit form
- Form with:
  - Sport title (required)
  - Description (optional)
  - Scoreboard preset selector (optional)

## What we need from backend

**To create sport:**
- Sport title
- Sport description (optional)
- Scoreboard preset id (optional)
- [Interface: `SportCreate`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchemaCreate`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `POST /api/sports/`

**To populate scoreboard preset selector:**
- Preset id
- Preset title
- Current scoreboard configuration (period mode, gameclock direction, etc.)
- [Interface: `SportScoreboardPreset`](../../../src/app/features/sport-scoreboard-presets/models/sport-scoreboard-preset.model.ts)
- [Backend Schema: `SportScoreboardPresetSchema`](../../../../statsboards-backend/src/sport_scoreboard_presets/schemas.py)
- **Backend API Endpoint:** `GET /api/sport-scoreboard-presets/`
