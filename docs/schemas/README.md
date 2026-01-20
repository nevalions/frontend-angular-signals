# Page Schemas

This directory contains the **source of truth** for all pages in the frontend project.

## 🚨 CRITICAL RULES

### For Developers/Agents

1. **NEVER modify schema files without explicit user permission**
    - These files define the complete page structure and data requirements
    - Any changes must be approved by the user first
    - If you need to modify a schema, ask the user before making changes

2. **Schema-First Development Workflow**
    - Before creating any component, check if the schema exists
    - If schema doesn't exist, **STOP** and ask the user to create it first
    - Only after the schema is approved, proceed with component creation
    - Component must match the schema exactly (UI elements, data requirements, backend endpoints)

3. **Schema Validation**
    - Every page must have a corresponding schema file
    - Complex schemas (mixed schemas) are marked with ⚠️
    - Backend schema links must match actual backend schemas in `../../statsboards-backend/src/`
    - Backend API endpoints must be verified to exist
    - If an endpoint doesn't exist, add a TODO and notify the user

4. **When Working with Existing Pages**
    - Read the schema first to understand requirements
    - Follow the schema exactly for implementation
    - Don't add features not in the schema without user approval
    - If you need to change the page, update the schema first (with user approval)

## Directory Structure

```
docs/schemas/
 ├── home.md                        # Pages without tabs
 ├── sports-list.md                 # List pages
 ├── sport-detail.md                # Detail pages with tab links
 ├── sport-edit.md                 # Edit/Create pages
  ├── match-create.md                # Match create page
  ├── match-detail.md               # Match detail page with tabs
  ├── settings.md                   # Settings page (admin)
  ├── user/                         # User-related pages
  │   └── profile.md                # User profile page
  ├── scoreboards/                   # Scoreboard-related pages and components
  │   ├── scoreboard-admin.md         # Scoreboard control/admin page
  │   ├── scoreboard-view.md         # FullHD scoreboard view page (broadcast)
  │   └── scoreboard-display.md       # Shared scoreboard display component
  ├── shared/                       # Shared/reusable components
  │   └── user-card.md             # User card component used in multiple places
  ├── match-detail-tabs/            # Match detail page tabs (no navbar/entity header)
  │    ├── match-players.md         # Players in match tab
  │    ├── events.md                # Match events tab
  │    └── stats.md                 # Match statistics tab
  ├── sport-detail-tabs/             # Individual tabs (no navbar/entity header)
  │    ├── tournaments.md
  │    ├── teams.md
  │    ├── players.md              # ⚠️ Complex schema marked
  │    └── positions.md
  └── settings-tabs/                 # Settings page tabs (no navbar/entity header)
       ├── dashboard.md              # Dashboard overview tab (default)
       ├── users.md                  # Users list tab
       ├── roles.md                  # Roles management tab
       └── global-settings.md        # Global settings tab (seasons)
```

**Component Schemas:**

Some schema files document **shared/reusable components** (not full pages):
- `scoreboards/scoreboard-display.md` - Main scoreboard display component used by both admin and view pages
- `shared/user-card.md` - User card component used in settings tabs (users) and potentially other user lists
- Component schemas follow the same format as page schemas but document inputs, display elements, and animations instead of page layout

## Schema Template

**📖 For detailed step-by-step instructions on creating schemas, see [Schema Creation Guide](../schema-creation-guide.md)**

Quick template reference:

```markdown
# Page Name Schema

**Route**: `/route/path`

```
┌─────────────────────────────────────────┐
│             NAVBAR                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Page Content                │
└─────────────────────────────────────────┘
```

## What's on the page

- Element1
- Element2
- List of items
  - Item property

## What we need from backend

**For data list:**
- Property 1
- Property 2
- [Interface: `InterfaceName`](../../../src/app/path/to/model.ts)
- [Backend Schema: `SchemaName`](../../../../statsboards-backend/src/path/to/schemas.py)
- **Backend API Endpoint:** `GET /api/endpoint`
```

## Schema Elements

Each schema file must include:

1. **Route**: The frontend route path
2. **ASCII Art**: Visual representation of the page layout (including tabs)
3. **What's on the page**: Simple bullet list of UI elements
4. **What we need from backend**:
    - Required data fields
    - Frontend interface link (e.g., `[Interface: Player]`)
    - Backend schema link (e.g., `[Backend Schema: PlayerSchema]`)
    - Backend API endpoint (e.g., `GET /api/players`)
    - TODOs for missing endpoints (see [TODO Guidelines](#adding-todos))
    - ⚠️ mark for complex/combined schemas

## Adding TODOs

**⚠️ CRITICAL: Always verify backend endpoints exist before adding TODOs**

- **Only add TODOs when the endpoint is genuinely missing from backend code**
- See [Schema Creation Guide](../schema-creation-guide.md#step-6-add-todos-for-missing-endpoints) for detailed instructions
- Quick verification checklist:
  - Check `views.py` for custom endpoints
  - Check `BaseRouter` for standard CRUD (GET, DELETE)
  - Search: `grep -rn "endpoint/path" ../statsboards-backend/src/`

