# Page Schemas & Backend Data

---

## Home Page

**Link**: `/home`

### What's on the page

- Welcome title: "Welcome to Statsboard"
- Subtitle: "Your comprehensive sports statistics management system"
- Sports link card with icon
  - Click to go to Sports page

### What we need from backend

- Nothing (all content is static)

---

## Sports List Page

**Link**: `/sports`

### What's on the page

- List of all sports
- Each sport shows:
  - Sport name
  - Link to sport detail page

### What we need from backend

- List of all sports with:
  - Sport ID
  - Sport name

---

## Sport Detail Page

**Link**: `/sports/:id`

### What's on the page

- Sport name (header)
- Sport details
- Seasons section
  - List of years with seasons
- Navigation to:
  - Edit sport
  - View tournaments for a season
  - View teams
  - Create match
  - View players

### What we need from backend

- Sport details with:
  - Sport ID
  - Sport name
  - Sport description
  - List of seasons (years)

---

## Tournament List Page

**Link**: `/sports/:sportId/seasons/:year/tournaments`

### What's on the page

- Sport and season info (header)
- List of tournaments
- Each tournament shows:
  - Tournament name
  - Tournament dates
  - Link to tournament detail
- "Create Tournament" button

### What we need from backend

- Sport name
- Season year
- List of tournaments with:
  - Tournament ID
  - Tournament name
  - Start date
  - End date

---

## Tournament Detail Page

**Link**: `/sports/:sportId/seasons/:year/tournaments/:id`

### What's on the page

- Tournament name (header)
- Tournament details (dates, location, etc.)
- List of teams in tournament
- List of matches
- Navigation to:
  - Edit tournament
  - View team details
  - Create match

### What we need from backend

- Tournament details with:
  - Tournament ID
  - Tournament name
  - Start date
  - End date
  - Location
  - Other tournament info
- List of teams in tournament with:
  - Team ID
  - Team name
- List of matches with:
  - Match ID
  - Date/time
  - Teams playing
  - Score (if played)

---

## Team Detail Page

**Link**: `/sports/:sportId/teams/:teamId`

### What's on the page

- Team name (header)
- Team details (city, founded date, etc.)
- List of players on team
- List of matches
- Navigation to:
  - Edit team
  - View player details

### What we need from backend

- Team details with:
  - Team ID
  - Team name
  - City
  - Founded date
  - Other team info
- List of players with:
  - Player ID
  - Player name
  - Position
  - Number
- List of matches with:
  - Match ID
  - Date/time
  - Opponent
  - Score

---

## Player Detail Page

**Link**: `/sports/:sportId/players/:playerId`

### What's on the page

- Player name (header)
- Player details (position, number, birth date, etc.)
- Player stats
  - Games played
  - Goals/score/points (sport-specific)
  - Other statistics
- Team information
- Match history

### What we need from backend

- Player details with:
  - Player ID
  - Player name
  - Position
  - Jersey number
  - Birth date
  - Height/weight (if applicable)
- Player statistics with:
  - Games played
  - Goals/score/points (sport-specific)
  - Other stats
- Team information with:
  - Team ID
  - Team name
- List of matches with:
  - Match ID
  - Date
  - Opponent
  - Player's performance in match

---

## Persons List Page

**Link**: `/persons`

### What's on the page

- List of all persons (players, coaches, referees, etc.)
- Each person shows:
  - Person name
  - Role (player/coach/referee)
  - Link to person detail page
- "Create Person" button

### What we need from backend

- List of persons with:
  - Person ID
  - Person name
  - Role type

---

## Person Detail Page

**Link**: `/persons/:id`

### What's on the page

- Person name (header)
- Person details
  - Role (player/coach/referee)
  - Contact information
  - Birth date
  - Other personal info
- Sports/teams associated
- Match history (if applicable)
- Navigation to:
  - Edit person
  - View player stats (if player)

### What we need from backend

- Person details with:
  - Person ID
  - Person name
  - Role type
  - Contact info
  - Birth date
  - Other personal details
- Associated sports/teams with:
  - Sport ID and name
  - Team ID and name (if applicable)
- Match history (if applicable)

---

## Match Create Page

**Link**: `/sports/:sportId/matches/new`

### What's on the page

- Match creation form
  - Select tournament
  - Select team A
  - Select team B
  - Select date/time
  - Select location/venue
- "Create Match" button
- "Cancel" button

### What we need from backend

- List of tournaments (for dropdown)
- List of teams (for dropdown)

---

## Sport Edit Page

**Link**: `/sports/:id/edit`

### What's on the page

- Sport edit form
  - Sport name
  - Sport description
  - Other sport details
- "Save" button
- "Cancel" button

### What we need from backend

- Current sport details

---

## Tournament Create Page

**Link**: `/sports/:sportId/seasons/:year/tournaments/new`

### What's on the page

- Tournament creation form
  - Tournament name
  - Start date
  - End date
  - Location/venue
  - Other tournament details
- "Create Tournament" button
- "Cancel" button

### What we need from backend

- None (sport and season come from URL)

---

## Tournament Edit Page

**Link**: `/sports/:sportId/seasons/:year/tournaments/:id/edit`

### What's on the page

- Tournament edit form
  - Tournament name
  - Start date
  - End date
  - Location/venue
  - Other tournament details
- "Save" button
- "Cancel" button

### What we need from backend

- Current tournament details

---

## Team Create Page

**Link**: `/sports/:sportId/teams/new`

### What's on the page

- Team creation form
  - Team name
  - City
  - Founded date
  - Other team details
- "Create Team" button
- "Cancel" button

### What we need from backend

- None (sport comes from URL)

---

## Team Edit Page

**Link**: `/sports/:sportId/teams/:teamId/edit`

### What's on the page

- Team edit form
  - Team name
  - City
  - Founded date
  - Other team details
- "Save" button
- "Cancel" button

### What we need from backend

- Current team details

---

## Person Create Page

**Link**: `/persons/new`

### What's on the page

- Person creation form
  - First name
  - Last name
  - Role (player/coach/referee)
  - Contact information
  - Birth date
  - Other personal details
- "Create Person" button
- "Cancel" button

### What we need from backend

- None

---

## Person Edit Page

**Link**: `/persons/:id/edit`

### What's on the page

- Person edit form
  - First name
  - Last name
  - Role (player/coach/referee)
  - Contact information
  - Birth date
  - Other personal details
- "Save" button
- "Cancel" button

### What we need from backend

- Current person details
