# Schema Creation Guide

**Purpose:** Detailed tutorial for learning to create schema markdown files.

**Quick reference:** See [schemas/README.md](./schemas/README.md) for directory overview and CRITICAL RULES.

## What is a Schema?

A schema is the **source of truth** for a page that defines:

- The visual layout (ASCII art)
- UI elements on the page
- Data required from the backend
- API endpoints to use
- Links to frontend interfaces and backend schemas

## Schema Types

There are four main schema types:

| Type                 | Example Route      | File Location                  |
| -------------------- | ------------------ | ------------------------------ |
| **Home/Dashboard**   | `/home`            | `docs/schemas/home.md`         |
| **List Page**        | `/sports`          | `docs/schemas/sports-list.md`  |
| **Detail Page**      | `/sports/:id`      | `docs/schemas/sport-detail.md` |
| **Create/Edit Page** | `/sports/:id/edit` | `docs/schemas/sport-edit.md`   |

### Tab Schemas (Sub-pages without navbar)

Detail pages with tabs have separate schema files for each tab in `docs/schemas/{entity}-detail-tabs/`:

| Type    | Example Route             | File Location                                   |
| ------- | ------------------------- | ----------------------------------------------- |
| **Tab** | `/sports/:id#tournaments` | `docs/schemas/sport-detail-tabs/tournaments.md` |

**Important:** Tab schemas do NOT include the navbar or entity header - they only show the tab content area.

## Schema Template

```markdown
# Page Name Schema

**Route**: `/route/path`
```

┌─────────────────────────────────────────┐
│ NAVBAR │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Page Content │
└─────────────────────────────────────────┘

```

## What's on the page

- Element 1
- Element 2
- List of items
  - Item property

## What we need from backend

**For data list:**
- Property 1
- Property 2
- [Interface: `InterfaceName`](../../../src/app/path/to/model.ts)
- [Backend Schema: `SchemaName`](../../../../statsboards-backend/src/path/to/schemas.py)
- **Backend API Endpoint:** `GET /api/endpoint`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
```

## Step-by-Step Guide

### Pre-check: Verify Backend Endpoints Exist

Before creating or updating a schema, verify the backend endpoints:

1. **Navigate to backend:**

   ```bash
   cd ../statsboards-backend/src/
   ```

2. **Check entity views:**

   ```bash
   grep -rn "@router\." {entity}/views.py
   ```

3. **Check BaseRouter standard endpoints:**
   - `GET /api/{entity}/` - Get all elements
   - `GET /api/{entity}/id/{model_id}` - Get by id
   - `DELETE /api/{entity}/id/{model_id}` - Delete

4. **Search for specific endpoint patterns:**
   ```bash
   grep -rn "sports/id/{sport_id}/positions" src/
   ```

**Common endpoint patterns:**

- Custom endpoints: Defined in `views.py` with `@router.get()`, `@router.post()`, etc.
- Standard CRUD: Inherited from `BaseRouter` (check `src/core/base_router.py`)
- By sport filtering: `GET /api/sports/id/{sport_id}/teams/paginated`

### Step 1: Determine Schema Type

Ask yourself:

- Is this a home/dashboard page? → Use home template
- Is this a list of items? → Use list page template
- Is this showing details of a single entity? → Use detail page template
- Is this a create or edit form? → Use create/edit page template
- Is this a tab within a detail page? → Use tab template (no navbar/entity header)

### Step 2: Determine File Location

| Page Type                    | File Path                                         |
| ---------------------------- | ------------------------------------------------- |
| Home/List/Detail/Create/Edit | `docs/schemas/{kebab-case-name}.md`               |
| Tab within detail page       | `docs/schemas/{entity}-detail-tabs/{tab-name}.md` |

### Step 3: Write the ASCII Art

Use ASCII art to show the page layout. Common elements:

```text
┌─────────────────────────────────────────┐
│             NAVBAR                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ← Back  Title  [✏️ Edit] [🗑️ Delete] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [Tab 1] [Tab 2] [Tab 3]         Season ▼│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│              Content Area               │
│                                         │
└─────────────────────────────────────────┘
```

**ASCII Art Guidelines:**

- Use consistent width (60-70 chars)
- Show navigation elements (navbar, back buttons, tabs)
- Show forms, inputs, buttons
- Show list items and pagination controls
- Use icons (🏈, 🏆, ⚽, 🏃, etc.) for visual clarity
- Include field labels with \* for required fields

### Step 4: Document "What's on the page"

Use simple bullet points or a table to list UI elements:

**Example:**

```markdown
## What's on the page

- Page title: "Sports"
- List of sport cards:
  - Sport name
  - Description (optional)
  - Click to go to sport detail
```

Or use a table for complex content:

```markdown
## Content

| Element     | Type      | Value                                                               | Action                |
| ----------- | --------- | ------------------------------------------------------------------- | --------------------- |
| Title       | Text      | "Welcome to Statsboard"                                             | -                     |
| Sports Card | Link Card | Icon: 🏈<br>Title: "Sports"<br>Subtitle: "Browse sports categories" | Navigate to `/sports` |
```

### Step 5: Document Backend Requirements

This is the **most important section**. It defines what data is needed and where to get it.

```markdown
## What we need from backend

**For sports list:**

- Sport id
- Sport title
- Sport description (optional)
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/`

**Pagination metadata:**

- Total count
- Total pages
- Current page
- Items per page
```

#### Backend Requirements Format:

For each data source, include:

1. **Data fields** (bullet list of properties needed)
2. **Frontend interface link** - `[Interface: Name](relative/path/to/model.ts)`
   - Path is relative to schema file: `../../../src/app/...`
3. **Backend schema link** - `[Backend Schema: SchemaName](relative/path/to/schemas.py)`
   - Path is relative to schema file: `../../../../statsboards-backend/src/...`
4. **Backend API endpoint** - `**Backend API Endpoint:** METHOD /api/path`

### Step 6: Add TODOs for Missing Endpoints

**⚠️ CRITICAL: Always verify backend endpoints exist before adding TODOs**

Before adding a TODO, check the backend code to confirm the endpoint doesn't exist:

1. Check the entity's `views.py` file for custom endpoints
2. Check `BaseRouter` for standard CRUD endpoints (GET, DELETE)
3. Search for the endpoint pattern: `grep -rn "positions/" ../statsboards-backend/src/`
4. Verify the exact endpoint path in backend code

**BaseRouter provides these standard endpoints automatically:**

- `GET /api/{entity}/` - Get all
- `GET /api/{entity}/id/{model_id}` - Get by id
- `DELETE /api/{entity}/id/{model_id}` - Delete

**Only add TODOs when:**

- The endpoint is genuinely missing from backend code
- The endpoint requires special filtering (e.g., paginated by sport)
- The endpoint has non-standard parameters or behavior

**Example of when to add TODO:**

```markdown
- **Backend API Endpoint:** `GET /api/seasons/id/{season_id}/sports/id/{sport_id}/tournaments`
- **TODO:** Need paginated endpoint for tournaments by sport and season (currently returns all results)
```

**Example of when NOT to add TODO (endpoint exists):**

```markdown
- **Backend API Endpoint:** `DELETE /api/positions/id/{model_id}` (from BaseRouter)
```

**Do NOT add TODO for:**

- Standard CRUD endpoints provided by BaseRouter
- Endpoints that exist in `views.py` or custom router methods
- Delete operations that inherit from BaseRouter

### Step 7: Mark Complex Schemas

If the schema combines multiple backend schemas (joins data from multiple tables), mark it with ⚠️:

```markdown
## What we need from backend

⚠️ **COMPLEX SCHEMA: Player with Person and Photos**

- Player id
- Person first name
- Person second name (surname)
- Player EESL ID (optional)
- Player photo icon URL (optional)
```

### Step 8: Verify Links

Before finalizing, verify:

- [ ] Frontend interface file exists
- [ ] Backend schema file exists
- [ ] Backend API endpoint exists in backend code
- [ ] Relative paths are correct

## Common Patterns

### Detail Page with Tabs

**File:** `docs/schemas/sport-detail.md`

```markdown
# Sport Detail Page Schema

**Route**: `/sports/:id`
```

┌─────────────────────────────────────────┐
│ NAVBAR │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ← Back Sport Name [✏️ Edit] [🗑️ Delete]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [Tournaments] [Teams] [Players] Season ▼│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ │
│ Tab Content Area │
│ │
└─────────────────────────────────────────┘

```

## What's on the page

- Entity header with back button, title, edit, delete
- Tab navigation
- Season dropdown
- Tab content area
```

### Tab Schema (No Navbar)

**File:** `docs/schemas/sport-detail-tabs/tournaments.md`

```markdown
# Sport Detail - Tournaments Tab

**Tab**: Tournaments
```

┌─────────────────────────────────────────┐
│ │
│ 🔍 Search [+ Add Tournament] │
│ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🏆 │
│ TOURNAMENT NAME │
│ Description │
└─────────────────────────────────────────┘

```

## What's on the page

- Search field
- "Add Tournament" button → [Tournament Create](../tournament-create.md)
- List of tournament cards
```

**Important:** Tab schemas do NOT include navbar or entity header - just the tab content.

### List Page

**File:** `docs/schemas/sports-list.md`

```markdown
# Sports List Page Schema

**Route**: `/sports`
```

┌─────────────────────────────────────────┐
│ NAVBAR │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Sports │
│ │
│ ┌────────────────────────────────┐ │
│ │ Sport Name 1 │ │
│ │ Description │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Sport Name 2 │ │
│ │ Description │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────────┘

[Items per page: 10 20 50] [< 1 2 3 >]

```

## What we need from backend

**For sports list:**
- Sport id
- Sport title
- Sport description (optional)
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/`

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
```

### Create/Edit Form Page

**File:** `docs/schemas/team-create.md`

```markdown
# Team Create Page Schema

**Route**: `/sports/:sportId/teams/new`
```

┌─────────────────────────────────────────┐
│ NAVBAR │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Create New Team [Cancel] [Create]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Title _ │
│ [_______________________] │
│ │
│ City │
│ [Enter city (optional)] │
│ │
│ Team Color _ │
│ [🎨 #DA291C] │
└─────────────────────────────────────────┘

```

## What's on the page

- Page title: "Create New Team"
- "Cancel" and "Create Team" buttons
- Form fields:
  - Title (required)
  - City (optional)
  - Team color (required)

## What we need from backend

**For creating team:**
- Title (required)
- City (optional)
- Team color (required)
- Sport ID (from route parameter `:sportId`)
- [Interface: `TeamCreate`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchemaCreate`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `POST /api/teams/`
```

## Naming Conventions

### File Names

- Use kebab-case: `sport-detail.md`, `team-create.md`
- Tab files in `{entity}-detail-tabs/` directory
- Clear and descriptive: `players.md`, not `player-list.md`

### Schema Titles

- Use title case: `# Sport Detail Page Schema`
- For tabs: `# Sport Detail - Players Tab`

### Route Format

```markdown
**Route**: `/sports/:id`
**Route**: `/tournaments/create`
**Route**: `/sports/:sportId/teams/new`
```

## Cross-References

Use markdown links to reference related schemas:

```markdown
- "Add Team" button → Navigate to [Team Create](../team-create.md)
```

## Checklist Before Committing

- [ ] Schema type is correct (home/list/detail/create/edit/tab)
- [ ] File location follows convention
- [ ] ASCII art shows complete layout
- [ ] "What's on the page" is complete
- [ ] All backend requirements are documented
- [ ] Frontend interface links are correct
- [ ] Backend schema links are correct
- [ ] **Backend API endpoints exist in backend code (verified)**
- [ ] TODOs added ONLY for genuinely missing endpoints
- [ ] Complex schemas are marked with ⚠️
- [ ] Cross-references use correct relative paths

**Before finalizing TODOs:**

- [ ] Checked `views.py` for custom endpoints
- [ ] Checked `BaseRouter` for standard CRUD endpoints
- [ ] Verified exact endpoint path matches backend implementation
- [ ] Confirmed endpoint is truly missing, not just in different location

## Examples

See existing schemas for reference:

- [Home Page](../docs/schemas/home.md)
- [Sports List](../docs/schemas/sports-list.md)
- [Sport Detail](../docs/schemas/sport-detail.md)
- [Tournaments Tab](../docs/schemas/sport-detail-tabs/tournaments.md)
- [Team Create](../docs/schemas/team-create.md)
