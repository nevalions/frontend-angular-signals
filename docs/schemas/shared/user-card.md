# User Card Component Schema

**Component**: `UserCardComponent`
**Type**: Shared/Reusable Component
**Usage**: Used in Settings - Users tab (full display), Settings - Admins tab (simplified display), potentially other user list pages

```
┌──────────────────────────────────────────────────────────────────────┐
│  username                        [Online/Offline] 🟢/⚪            │
│  email@example.com                                             │
│                                                               │
│  Roles: [user] [player]                                        │
│  Account Status: [Active] 🟢 / [Inactive] 🟠                   │
│  Member Since: Jan 10, 2026                                   │
│  Last Online: Jan 15, 2026                                    │
│                                                               │
│  [✏️ Edit] [🗑️ Remove]  (optional, based on inputs)          │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Overview

The `UserCardComponent` is a reusable, signal-based card component for displaying user information with configurable visibility options. It supports:

- **Conditional display** of user information sections (online status, account status, dates)
- **Optional action buttons** (edit/remove) with event handling
- **Click navigation** to user detail page
- **Hover effects** for better UX
- **Signal-based inputs** for reactive updates

## Component Inputs

```typescript
@Input() user: UserList;                              // Required: User data object
@Input() showOnlineStatus: boolean = true;              // Show/hide online/offline badge
@Input() showAccountStatus: boolean = true;             // Show/hide active/inactive badge
@Input() showMemberSince: boolean = true;              // Show/hide member since date
@Input() showLastOnline: boolean = true;               // Show/hide last online date
@Input() showEditButton: boolean = false;              // Show/hide edit action button
@Input() showRemoveButton: boolean = false;            // Show/hide remove action button
```

## Component Outputs

```typescript
@Output() cardClick: EventEmitter<number>;              // Emits user ID when card is clicked
@Output() editClick: EventEmitter<UserList>;            // Emits user object when edit button is clicked
@Output() removeClick: EventEmitter<UserList>;          // Emits user object when remove button is clicked
```

## Display Elements

### User Header

- **Username**: `user.username`
  - Font size: 1rem
  - Font weight: 600
  - Color: `var(--tui-text-primary)`

- **Online/Offline Badge** (if `showOnlineStatus` = true):
  - Text: "Online" (if `user.is_online` = true) / "Offline" (if false)
  - Taiga UI Badge: `appearance="positive"` (online) / `appearance="neutral"` (offline)
  - Size: `s`

### User Email

- **Email**: `user.email`
  - Font size: 0.875rem
  - Color: `var(--tui-text-secondary)`

### User Details

- **Roles List**: `user.roles` (array of role strings)
  - Each role displayed as Taiga UI Badge: `appearance="primary"`, size: `s`
  - Flex layout with gap: 0.375rem
  - If empty or null, shows "No roles" badge with `appearance="neutral"`

- **Account Status Badge** (if `showAccountStatus` = true):
  - Text: "Active" (if `user.is_active` = true) / "Inactive" (if false)
  - Taiga UI Badge: `appearance="positive"` (active) / `appearance="warning"` (inactive)
  - Size: `s`

- **Member Since** (if `showMemberSince` = true):
  - Label: "Member Since:"
  - Value: Formatted date from `user.created`
  - Format: `toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`
  - Returns "N/A" if date is null or invalid

- **Last Online** (if `showLastOnline` = true):
  - Label: "Last Online:"
  - Value: Formatted date from `user.last_online`
  - Format: Same as Member Since
  - Returns "N/A" if date is null or invalid

### Action Buttons (Optional)

- **Edit Button** (if `showEditButton` = true):
  - Icon: `@tui.edit`
  - Appearance: `flat`, size: `s`
  - Emits `editClick` with user object
  - Stops event propagation to prevent card navigation

- **Remove Button** (if `showRemoveButton` = true):
  - Icon: `@tui.ban`
  - Appearance: `flat`, size: `s`
  - Color: `var(--tui-text-negative)` (danger)
  - Emits `removeClick` with user object
  - Stops event propagation to prevent card navigation

### Hover Effects

- Card transforms: `translateY(-2px)` on hover
- Transition: `transform 0.2s ease`
- Cursor: `pointer`

## Configuration Examples

### Full Display (Users Tab)

Shows all user information with navigation on click:

```html
<app-user-card
  [user]="user"
  [showOnlineStatus]="true"
  [showAccountStatus]="true"
  [showMemberSince]="true"
  [showLastOnline]="true"
  [showEditButton]="false"
  [showRemoveButton]="false"
  (cardClick)="navigateToUserDetail(user.id)" />
```

### Simplified Display (Admins Tab)

Shows minimal information with action buttons:

```html
<app-user-card
  [user]="admin"
  [showOnlineStatus]="false"
  [showAccountStatus]="true"
  [showMemberSince]="false"
  [showLastOnline]="false"
  [showEditButton]="true"
  [showRemoveButton]="true"
  (editClick)="editAdmin(admin)"
  (removeClick)="removeAdmin(admin)" />
```

## Styling

### Layout Structure

```less
.user-card {
  cursor: pointer;
  transition: transform 0.2s ease;

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__detail-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__detail-label {
    font-size: 0.8125rem;
    color: var(--tui-text-tertiary);
    font-weight: 500;
  }

  &__detail-value {
    font-size: 0.8125rem;
    color: var(--tui-text-primary);
  }

  &__roles-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  &__action-button--danger {
    color: var(--tui-text-negative);
  }
}
```

## What we need from backend

**User Data:**
- `id` - User unique identifier
- `username` - User's username
- `email` - User's email address
- `is_active` - Boolean: account active status
- `is_online` - Boolean: current online status
- `roles` - Array of strings: user's assigned roles
- `created` - ISO 8601 datetime: account creation timestamp
- `last_online` - ISO 8601 datetime or null: last activity timestamp

- [Interface: `UserList`](../../../src/app/features/settings/models/settings.model.ts)
- [Backend Schema: `UserSchema`](../../../../statsboards-backend/src/users/schemas.py)

**Backend API Endpoints:**
- `GET /api/users/search` - Search and list users (for users tab)
- `GET /api/users/search` - Search and list users (for admins tab, filtered to admin role)
- `PUT /api/users/{user_id}` - Update user (for edit action)
- `DELETE /api/users/{user_id}` - Delete user (for remove action, if needed)

## Examples Used In

- **Settings - Users Tab**: Full display with all fields, navigates to user profile on click
- **Settings - Admins Tab**: Simplified display with account status and edit/remove actions

## TODOs

None - all endpoints verified to exist in backend code
