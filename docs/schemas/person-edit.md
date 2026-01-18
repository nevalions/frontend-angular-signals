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
 │  Photo                                                     │
 │  [Choose file...]                                           │
 │  [Original] [Icon] [Web View]                            │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Person"
- "Cancel" button → Navigate to person detail
- "Save" button → Submit form
 - Form with:
   - First Name field (required, pre-filled)
   - Second Name field (required, pre-filled)
   - Photo (optional, pre-filled) - File upload with preview showing Original, Icon, Web View

## What we need from backend

 **To get person data for editing:**
 - Person id
 - Person first name
 - Person second name
 - Person photo URLs (optional)
   - Original URL
   - Icon URL
   - Web View URL
 - [Interface: `Person`](../../../src/app/features/persons/models/person.model.ts)
 - [Backend Schema: `PersonSchema`](../../../../statsboards-backend/src/persons/schemas.py)
 - **Backend API Endpoint:** `GET /api/persons/id/{person_id}/`

 **To update person:**
 - Person id
 - Person first name
 - Person second name
 - Person photo URLs (optional) - from file upload
   - Original URL
   - Icon URL
   - Web View URL
 - [Interface: `PersonUpdate`](../../../src/app/features/persons/models/person.model.ts)
 - [Backend Schema: `PersonSchemaUpdate`](../../../../statsboards-backend/src/persons/schemas.py)
 - **Backend API Endpoint:** `PUT /api/persons/id/{person_id}/`
 - **Backend File Upload Endpoint:** `POST /api/persons/upload_resize_photo` (optional)
