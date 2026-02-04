# Sponsor Edit Page Schema

**Route**: `/sponsors/:id/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Edit Sponsor                                [Cancel] [Update]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Sponsor Title *                                             │
│ [_____________________________]                            │
│                                                             │
│ Logo (optional)                                             │
│ [Current logo preview] [Upload image] [Remove]             │
│                                                             │
│ Logo Scale (optional)                                      │
│ [ 1.0 ]                                                     │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Sponsor"
- "Cancel" and "Update" buttons
- Form fields:
  - Sponsor title (required)
  - Logo upload with preview (optional)
  - Logo scale (optional)

## What we need from backend

**For sponsor details (pre-fill):**
- Sponsor id
- Sponsor title
- Sponsor logo URL (optional)
- Sponsor logo scale (optional)
- [Interface: `Sponsor`](../../../src/app/shared/types/entities.types.ts)
- [Backend Schema: `SponsorSchema`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `GET /api/sponsors/id/{item_id}/`

**For updating sponsor:**
- Sponsor title (optional)
- Sponsor logo URL (optional)
- Sponsor logo scale (optional)
- [Interface: `SponsorUpdate`](../../../src/app/features/sponsors/models/sponsor.model.ts)
- [Backend Schema: `SponsorSchemaUpdate`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `PUT /api/sponsors/{item_id}/`

**For uploading sponsor logo (optional):**
- Image file
- [Backend Schema: `UploadSponsorLogoResponse`](../../../../statsboards-backend/src/sponsors/schemas.py)
- **Backend API Endpoint:** `POST /api/sponsors/upload_logo`
