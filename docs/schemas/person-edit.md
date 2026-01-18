# Person Edit Page Schema

**Route**: `/persons/:id/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Edit Person                                [Cancel] [Save] │
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

- Page title: "Edit Person"
- "Cancel" button → Navigate to person detail
- "Save" button → Submit form
- Form with:
  - First Name field (required, pre-filled)
  - Second Name field (required, pre-filled)
  - Photo URL field (optional, pre-filled)

## What we need from backend

**To get person data for editing:**
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- [Interface: `Person`](../../../src/app/features/persons/models/person.model.ts)
- [Backend Schema: `PersonSchema`](../../../../statsboards-backend/src/persons/schemas.py)
- **Backend API Endpoint:** `GET /api/persons/id/{person_id}/`

**To update person:**
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- [Interface: `PersonUpdate`](../../../src/app/features/persons/models/person.model.ts)
- [Backend Schema: `PersonSchemaUpdate`](../../../../statsboards-backend/src/persons/schemas.py)
- **Backend API Endpoint:** `PUT /api/persons/id/{person_id}/`
