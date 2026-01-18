# Sport Detail - Positions Tab

**Tab**: Positions

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search positions             [+ Add Position]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  Position Title 1                              [✏️] [🗑️] │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Position Title 2                              [✏️] [🗑️] │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Position Title 3                              [✏️] [🗑️] │
└─────────────────────────────────────────────────────────────┘
                                                              │
[Items per page: 10 20 50]           [< 1 2 3 >]
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────┐     │
│  │  Add Position / Edit Position           [✕]     │     │
│  ├──────────────────────────────────────────────────┤     │
│  │  Title: [____________]                          │     │
│  ├──────────────────────────────────────────────────┤     │
│  │          [Cancel] [Create / Update]            │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Search field for positions
- "Add Position" button → Open add position form modal
- List of position cards:
  - Position title
  - Edit button → Open edit position form modal
  - Delete button → Confirm and delete position
- Items per page selector (10, 20, 50)
- Pagination controls
- Position form modal (when open):
  - Title input
  - "Cancel" button → Close modal without saving
  - "Create" button (add mode) → Submit form to create position
  - "Update" button (edit mode) → Submit form to update position
  - Close button (X) → Close modal without saving

## What we need from backend

**For positions list:**
- Position id
- Position title
- [Interface: `Position`](../../../src/app/features/sports/models/position.model.ts)
- [Backend Schema: `PositionSchema`](../../../../statsboards-backend/src/positions/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/positions`

**For creating position:**
- Position title
- Sport ID (from route parameter `:sportId`)
- [Interface: `Position`](../../../src/app/features/sports/models/position.model.ts)
- [Backend Schema: `PositionSchemaCreate`](../../../../statsboards-backend/src/positions/schemas.py)
- **Backend API Endpoint:** `POST /api/positions/`

**For updating position:**
- Position id
- Position title
- [Interface: `Position`](../../../src/app/features/sports/models/position.model.ts)
- [Backend Schema: `PositionSchemaUpdate`](../../../../statsboards-backend/src/positions/schemas.py)
- **Backend API Endpoint:** `PUT /api/positions/{item_id}/`

**For deleting position:**
- Position id
- [Interface: `Position`](../../../src/app/features/sports/models/position.model.ts)
- [Backend API Endpoint:** `DELETE /api/positions/id/{model_id}` (from BaseRouter)

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
