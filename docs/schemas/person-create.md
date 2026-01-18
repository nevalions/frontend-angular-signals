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
 │  Photo                                                     │
 │  [Choose file...]                                           │
 │  [Original] [Icon] [Web View]                            │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create Person"
- "Cancel" button → Navigate back to persons list
- "Save" button → Submit form
 - Form with:
   - First Name field (required)
   - Second Name field (required)
   - Photo (optional) - File upload with preview showing Original, Icon, Web View

## What we need from backend

 **To create person:**
 - Person first name
 - Person second name
 - Person photo URLs (optional) - from file upload
   - Original URL
   - Icon URL
   - Web View URL
 - [Interface: `PersonCreate`](../../../src/app/features/persons/models/person.model.ts)
 - [Backend Schema: `PersonSchemaCreate`](../../../../statsboards-backend/src/persons/schemas.py)
 - **Backend API Endpoint:** `POST /api/persons/`
 - **Backend File Upload Endpoint:** `POST /api/persons/upload_resize_photo` (optional)
