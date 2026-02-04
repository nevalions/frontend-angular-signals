# Sponsor Create Page Schema

**Route**: `/sponsors/new`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Create New Sponsor                         [Cancel] [Create]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Sponsor Title *                                             │
│ [_____________________________]                            │
│                                                             │
│ Logo (optional)                                             │
│ [Upload image] [Remove]                                    │
│                                                             │
│ Logo Scale (optional)                                      │
│ [ 1.0 ]                                                     │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Create New Sponsor"
- "Cancel" and "Create" buttons
- Form fields:
  - Sponsor title (required)
  - Logo upload (optional)
  - Logo scale (optional)

## What we need from backend

**For creating sponsor:**
- Sponsor title (required)
- Sponsor logo URL (optional)
- Sponsor logo scale (optional)
- [Interface: `SponsorCreate`](../../../src/app/features/sponsors/models/sponsor.model.ts)
- [Backend Schema: `SponsorSchemaCreate`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `POST /api/sponsors/`

**For uploading sponsor logo (optional):**
- Image file
- [Backend Schema: `UploadSponsorLogoResponse`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `POST /api/sponsors/upload_logo`
