# Person Create Page Schema

**Route**: `/persons/new`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Create Person                              [Cancel] [Save] │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  First Name *                                             │
│  [First name]                                             │
│                                                             │
│  Second Name *                                            │
│  [Second name]                                            │
│                                                             │
│  Photo URL                                                 │
│  [https://example.com/photo.jpg]                           │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create Person"
- "Cancel" button → Navigate back to persons list
- "Save" button → Submit form
- Form with:
  - First Name field (required)
  - Second Name field (required)
  - Photo URL field (optional)

## What we need from backend

**To create person:**
- Person first name
- Person second name
- Person photo URL (optional)
- [Interface: `PersonCreate`](../../../src/app/features/persons/models/person.model.ts)
- [Backend Schema: `PersonSchemaCreate`](../../../../statsboards-backend/src/persons/schemas.py)
- **Backend API Endpoint:** `POST /api/persons/`
