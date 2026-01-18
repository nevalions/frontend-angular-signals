# Persons List Page Schema

**Route**: `/persons`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Persons                              │
│                                                             │
│   ┌──────────────────────────────────────────────────┐    │
│   │  [Avatar]                                        │    │
│   │  SECOND, First                                   │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────────────┐    │
│   │  [Avatar]                                        │    │
│   │  SMITH, John                                     │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│           Add Person                                       │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Persons"
- "Add Person" button → Navigate to `/persons/new`
- Search input → Filter persons by name
- Sort controls:
  - Sort by First Name (asc/desc)
  - Sort by Second Name (asc/desc)
- List of person cards:
  - Person photo avatar (or initials)
  - Person name (SECOND, First format)
  - Click to go to person detail
- Pagination controls
- Items per page selector

## What we need from backend

**For persons list:**
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- [Interface: `Person`](../../../src/app/features/persons/models/person.model.ts)
- [Backend Schema: `PersonSchema`](../../../../statsboards-backend/src/persons/schemas.py)
- **Backend API Endpoint:** `GET /api/persons/paginated`
