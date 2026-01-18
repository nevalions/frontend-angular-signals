# Sport Detail - Players Tab

**Tab**: Players

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search players                  [+ Add Player]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  🔍 Select Person to add...      [Add Player] [Cancel]   │
└─────────────────────────────────────────────────────────────┘
                                                              │
[Sort by Name ⬆⬇]
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  [AB]                                                      │
│  SURNAME Firstname                                        │
│  EESL ID: 12345 (optional)                                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [CD]                                                      │
│  SURNAME Firstname                                        │
  │  EESL ID: 12346 (optional)                                 │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Search field for players
- "Add Player" button → Open add player form
- "Cancel" button → Close add player form
- Add player form (when open):
  - Person dropdown selector
  - "Add Player" button → Submit form to add player to sport
  - "Cancel" button → Close form without saving
- "Sort by Name" button → Toggle ascending/descending order
- List of player cards:
  - Avatar with initials
  - Player surname and first name
  - EESL ID (optional)
  - Click to go to player detail

## What we need from backend

**For players list:**
⚠️ **COMPLEX SCHEMA: Player with Person and Photos**
- Player id
- Person first name
- Person second name (surname)
- Player EESL ID (optional)
- Player photo icon URL (optional)
- [Interface: `PlayerWithDetailsAndPhotos`](../../../src/app/features/players/models/player.model.ts)
- [Backend Schema: `PlayerWithDetailsAndPhotosSchema`](../../../../statsboards-backend/src/player/schemas.py)
- **Backend API Endpoint:** `GET /api/players/paginated/details-with-photos?sport_id={sport_id}&page={page}&items_per_page={items_per_page}&search={search}&ascending={ascending}`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page

**For adding player (available persons):**
- Person id
- Person first name
- Person second name (surname)
- [Interface: `Person`](../../../src/app/features/persons/models/person.model.ts)
- [Backend Schema: `PersonSchema`](../../../../statsboards-backend/src/person/schemas.py)
- **Backend API Endpoint:** `GET /api/persons/not-in-sport/{sport_id}/all`

**For adding player to sport:**
- Person ID
- Sport ID (from route parameter `:sportId`)
- IsPrivate flag (optional)
- User ID (optional)
- [Interface: `PlayerAddToSport`](../../../src/app/features/players/models/player.model.ts)
- [Backend Schema: `PlayerAddToSportSchema`](../../../../statsboards-backend/src/player/schemas.py)
- **Backend API Endpoint:** `POST /api/players/add-person-to-sport`
