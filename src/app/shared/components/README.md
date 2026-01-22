# Shared Components

Reusable UI components used across the application.

## Components

### ConnectionIndicatorComponent

**Location:** `src/app/shared/components/connection-indicator/`

A visual indicator for WebSocket connection quality based on ping/pong round-trip time.

**Features:**
- Color-coded dot indicator (green/yellow/red/gray)
- Quality levels based on RTT (good <100ms, fair <300ms, poor >300ms, unknown)
- Optional label display
- Signal-based reactive API
- Standalone component

**Usage Example:**

```typescript
import { ConnectionIndicatorComponent } from '../../../../shared/components/connection-indicator/connection-indicator.component';

@Component({
  selector: 'app-scoreboard-admin',
  standalone: true,
  imports: [ConnectionIndicatorComponent],
  template: `
    <app-connection-indicator [showLabel]="true" />
  `,
})
export class ScoreboardAdminComponent {}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|----------|-------------|
| `showLabel` | `boolean` | No | `false` | Show/hide quality label text |

**Quality Levels:**

| Quality | RTT Range | Color | Label |
|---------|-----------|-------|-------|
| `good` | < 100ms | Green (#22c55e) | "Good" |
| `fair` | 100-300ms | Yellow (#eab308) | "Fair" |
| `poor` | > 300ms | Red (#ef4444) | "Poor" |
| `unknown` | No data | Gray (#6b7280) | "Connecting..." |

**Signals:**

| Name | Type | Description |
|------|------|-------------|
| `quality` | `Signal<'good' | 'fair' | 'poor' | 'unknown'>` | Current connection quality state |
| `qualityLabel` | `Signal<string>` | Human-readable label for current quality |

**Examples Used In:**
- Scoreboard admin page header

**Best Practices:**
1. Enable `showLabel` when space permits for better user visibility
2. Use `showLabel="false"` for compact displays where only the dot is needed
3. The component automatically tracks RTT via `WebSocketService.connectionQuality`

### TabsNavComponent

### TabsNavComponent

**Location:** `src/app/shared/components/tabs-nav/`

A reusable tab navigation component with three visual variants (pills, underline, segmented) used across detail pages, settings, and other tab-based layouts.

**Features:**
- Three appearance variants: pills, underline, segmented
- Configurable tab size (s, m, l) for segmented variant
- Tab icons support (optional)
- Active tab tracking via string value
- Responsive design with mobile-friendly stacked layout
- Signal-based API
- Accessible tab semantics with `role="tablist"` and `role="tab"`

**Layout Structure:**
- Segmented variant: Centered with max-width 500px, full-width on mobile with stacked buttons
- Pills variant: Flex-wrap with gap, compact padding
- Underline variant: Horizontal row with bottom border indicating active state

**Usage Example:**

```typescript
import { TabsNavComponent, TabsNavItem } from '../../../../shared/components/tabs-nav/tabs-nav.component';

@Component({
  selector: 'app-my-detail',
  standalone: true,
  imports: [TabsNavComponent],
  template: `
    <app-tabs-nav
      [tabs]="tabs"
      [activeTab]="activeTab()"
      appearance="segmented"
      segmentedSize="l"
      (tabChange)="onTabChange($event)"
    />
  `,
})
export class MyDetailComponent {
  readonly tabs: TabsNavItem[] = [
    { label: 'Overview', value: 'overview', icon: '@tui.info' },
    { label: 'Details', value: 'details', icon: '@tui.list' },
    { label: 'Settings', value: 'settings', icon: '@tui.settings' },
  ];

  activeTab = signal('overview');

  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
    });
  }
}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|----------|-------------|
| `tabs` | `TabsNavItem[]` | Yes | - | Array of tab definitions |
| `activeTab` | `string \| null` | Yes | - | Currently active tab value |
| `appearance` | `'pills' \| 'underline' \| 'segmented'` | No | `'pills'` | Visual variant to render |
| `segmentedSize` | `'s' \| 'm' \| 'l'` | No | `'l'` | Size for segmented variant (ignored for pills/underline) |

**Outputs:**

| Name | Type | Description |
|------|------|-------------|
| `tabChange` | `EventEmitter<string>` | Emits selected tab value when clicked |

**TabsNavItem Interface:**

```typescript
export interface TabsNavItem {
  label: string;                                              // Visible tab label
  value: string;                                              // Tab identifier used in routing/state
  icon?: string;                                              // Optional Taiga UI icon name
}
```

**Examples Used In:**
- Sport detail page (Tournaments, Teams, Players, Positions)
- Tournament detail page (Matches, Teams, Players)
- Match detail page (Players, Events, Stats)
- Settings page (Dashboard, Users, Roles, Global Settings)

**Responsive Behavior:**
- Desktop (768px+): Horizontal layout; segmented variant centered with max-width
- Mobile (< 768px): Smaller font (14px); segmented variant stacks vertically (one tab per line)

**Best Practices:**
1. Use `segmentedSize="l"` for better touch targets on detail pages
2. Wrap tab state management in route params for bookmarkable URLs:
   ```typescript
   activeTab = createStringParamSignal(this.route, 'tab', {
     source: 'queryParamMap',
     defaultValue: 'overview',
   });
   ```
3. Use `NavigationHelperService` for consistent navigation patterns
4. For tab icons, use standard Taiga UI icons (`@tui.*`)
5. Seged tabs automatically handle overflow and stacking on mobile via CSS

### UserCardComponent

**Location:** `src/app/shared/components/user-card/`

A reusable card component for displaying user information with configurable visibility options.

**Features:**
- Configurable display of user information (online status, account status, dates)
- Optional action buttons (edit/remove)
- Clickable card navigation
- Hover effects
- Signal-based API
- Built with Taiga UI components

**Usage Example:**

```typescript
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [UserCardComponent],
  template: `
    <div class="users-list">
      @for (user of users(); track user.id) {
        <app-user-card
          [user]="user"
          [showOnlineStatus]="true"
          [showAccountStatus]="true"
          [showMemberSince]="true"
          [showLastOnline]="true"
          (cardClick)="navigateToUserDetail(user.id)" />
      }
    </div>
  `,
})
export class UsersTabComponent {
  users = signal<UserList[]>([]);

  navigateToUserDetail(userId: number) {
    this.router.navigate(['/users', userId]);
  }
}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|----------|-------------|
| `user` | `UserList` | Yes | - | User data object |
| `showOnlineStatus` | `boolean` | No | `true` | Show/hide online/offline badge |
| `showAccountStatus` | `boolean` | No | `true` | Show/hide active/inactive badge |
| `showMemberSince` | `boolean` | No | `true` | Show/hide member since date |
| `showLastOnline` | `boolean` | No | `true` | Show/hide last online date |
| `showEditButton` | `boolean` | No | `false` | Show/hide edit action button |
| `showRemoveButton` | `boolean` | No | `false` | Show/hide remove action button |

**Outputs:**

| Name | Type | Description |
|------|------|-------------|
| `cardClick` | `EventEmitter<number>` | Emitted with user ID when card is clicked |
| `editClick` | `EventEmitter<UserList>` | Emitted with user object when edit button is clicked |
| `removeClick` | `EventEmitter<UserList>` | Emitted with user object when remove button is clicked |

**Examples Used In:**
- Settings - Users tab (full display with navigation)
- Settings - Admins tab (simplified display with action buttons)

**Best Practices:**
1. Set `showEditButton` and `showRemoveButton` to `true` when action buttons are needed (e.g., admins tab)
2. Use `showOnlineStatus`, `showMemberSince`, and `showLastOnline` to control information density
3. Handle `editClick` and `removeClick` events with `event.stopPropagation()` to prevent card navigation
4. The component automatically formats dates using `toLocaleDateString()` method

### NavbarComponent

**Location:** `src/app/shared/components/navbar/`

Main application navigation bar with dropdown menus, mobile responsiveness, and theme toggle.

**Features:**
- Sticky navbar with backdrop blur effect
- Dropdown menus with click-outside detection
- Mobile hamburger menu with slide-in animation
- Dark/light theme toggle
- Sports dropdown with dynamic sport list
- Responsive design
- Signal-based state management
- Accessibility support (ARIA labels, keyboard navigation)

**Layout Structure:**
- Left: Brand title
- Left-center: Hamburger menu (mobile), Navigation links (desktop)
- Right: Theme toggle and auth buttons
- Desktop: Navigation links aligned left after header
- Mobile: Hamburger menu opens vertical slide-in navigation

**Auth Buttons:**
- **Not logged in:** Shows Sign Up and Sign In buttons
- **Logged in:** Shows user avatar + username (clickable)
  - Opens dropdown menu with Profile and Logout options
  - Admin users additionally see Settings option
  - Dropdown closes when clicking outside component
  - Profile navigates to user's person detail page (or persons list if no person_id)
  - Settings navigates to `/settings` (admin only)
  - Logout clears session and redirects to home

**Click-Outside Dropdown Behavior:**
- Dropdowns automatically close when clicking outside the navbar
- Uses `@HostListener` to detect document clicks
- Checks if click target is outside `app-navbar` element
- Closes all open dropdowns when clicking elsewhere on the page

**Usage Example:**

```html
<app-navbar />
```

**Component API:**

**Signals:**
| Name | Type | Description |
|------|------|-------------|
| `sports` | `Signal<Sport[]>` | List of sports for dropdown |
| `seasons` | `Signal<Season[]>` | List of seasons |
| `openDropdowns` | `Signal<Set<number>>` | Set of open dropdown IDs |
| `mobileMenuOpen` | `Signal<boolean>` | Mobile menu open state |
| `currentTheme` | `Signal<'light' | 'dark'>` | Current theme |

**Methods:**

| Name | Parameters | Description |
|------|-----------|-------------|
| `toggleDropdown` | `sportId: number` | Toggle dropdown open/close |
| `isDropdownOpen` | `sportId: number` | Check if dropdown is open |
| `closeAllDropdowns` | - | Close all open dropdowns |
| `toggleMobileMenu` | - | Toggle mobile menu visibility |
| `closeMobileMenu` | - | Close mobile menu |
| `toggleTheme` | - | Switch between light/dark theme |
| `getThemeIcon` | - | Get current theme icon name |

**Responsive Behavior:**
- Desktop (768px+): Horizontal navigation bar
- Mobile (< 768px): Hamburger menu with vertical slide-in
- Dropdowns: Absolute positioned on desktop, static on mobile

**Theme Toggle:**
- Sun icon when dark mode active (click to switch to light)
- Moon icon when light mode active (click to switch to dark)
- Theme state managed by `ThemeService`

### EntityHeaderComponent

**Location:** `src/app/shared/components/entity-header/`

A reusable header component for detail pages with back button, title, and settings menu.

**Features:**
- Back button with custom navigation callback
- Optional logo display with proper sizing
- Uppercase title display (automatically converts to uppercase)
- Gear menu with Edit/Delete actions (can be hidden)
- Support for custom menu items
- Responsive design - title truncates with ellipsis, buttons always visible
- Signal-based API
- Built with Taiga UI components

**Usage Example:**

```typescript
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { buildStaticUrl } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-my-detail',
  standalone: true,
  imports: [EntityHeaderComponent],
  template: `
    <app-entity-header
      [title]="entityName"
      [logoUrl]="logoUrl()"
      [showEdit]="true"
      [showDelete]="true"
      [customMenuItems]="menuItems"
      (navigateBack)="onBack()"
      (edit)="onEdit()"
      (delete)="onDelete()"
      (customItemClick)="onCustomItemClick($event)"
    />
  `,
})
export class MyDetailComponent {
  entityName = 'My Entity';

  logoUrl = computed(() => {
    const entity = this.entity();
    return entity?.logo_path ? buildStaticUrl(entity.logo_path) : null;
  });

  onBack() {
    this.router.navigate(['/list']);
  }

  onEdit() {
    this.router.navigate(['/edit', this.id]);
  }

  onDelete() {
    this.service.delete(this.id);
  }

  menuItems = [
    { id: 'duplicate', label: 'Duplicate', icon: '@tui.copy' },
    { id: 'archive', label: 'Archive', icon: '@tui.archive' },
  ];

  onCustomItemClick(itemId: string) {
    if (itemId === 'duplicate') {
      this.duplicateEntity();
    } else if (itemId === 'archive') {
      this.archiveEntity();
    }
  }
}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|----------|-------------|
| `title` | `string` | Yes | - | Entity title (will be displayed in uppercase) |
| `logoUrl` | `string \| null` | No | - | Optional logo URL to display before title |
| `navigateBack` | `() => void` | Yes | - | Function called when back button is clicked |
| `showEdit` | `boolean` | No | `true` | Show/hide Edit menu item |
| `showDelete` | `boolean` | No | `true` | Show/hide Delete menu item |
| `customMenuItems` | `CustomMenuItem[]` | No | `[]` | Additional custom menu items |

**Outputs:**

| Name | Type | Description |
|------|------|-------------|
| `edit` | `EventEmitter<void>` | Emitted when Edit menu item is clicked |
| `delete` | `EventEmitter<void>` | Emitted when Delete menu item is clicked |
| `customItemClick` | `EventEmitter<string>` | Emitted with custom item ID when clicked |

**CustomMenuItem Interface:**

```typescript
interface CustomMenuItem {
  id: string;           // Unique identifier for the item
  label: string;         // Display text
  icon?: string;         // Taiga UI icon name (optional)
  type?: 'default' | 'danger';  // Styling variant (optional, default: 'default')
}
```

**Examples Used In:**
- Sport detail page
- Tournament detail page
- Team detail page
- Person detail page

**Responsive Behavior:**
- Desktop: All elements (Back, Title, Gear) on one line
- Small screens: Title truncates with `...`, Back and Gear always visible
- Title text overflow: `Very Long Title With...` (truncates)

**Best Practices:**
1. Stringify multi-field titles in parent component before passing to `title` input
   ```typescript
   personName = computed(() => `${person.first_name} ${person.second_name}`);
   ```
2. For `logoUrl`, always wrap static asset URLs with `buildStaticUrl()`:
   ```typescript
   logoUrl = computed(() => {
     const entity = this.entity();
     return entity?.logo_path ? buildStaticUrl(entity.logo_path) : null;
   });
   ```
3. Use `NavigationHelperService` for consistent navigation patterns
  4. For delete operations, use `withDeleteConfirm()` utility for consistent UX

### MatchFormComponent

**Location:** `src/app/shared/components/match-form/`

A reusable form component for creating and editing matches. Handles both create and edit modes with proper navigation callbacks.

**Features:**
- Support for both create and edit modes
- Dynamic form based on mode (create/update)
- Team selection with uppercase formatting
- Sponsor and sponsor line selection
- Date, week, and EESL ID fields
- Context-aware cancel navigation
- Signal-based API with Angular 19+ signals
- Built with Taiga UI components
- Proper validation and error handling

**Usage Example:**

```typescript
import { MatchFormComponent } from '../../../../shared/components/match-form/match-form.component';

@Component({
  selector: 'app-match-create',
  standalone: true,
  imports: [MatchFormComponent],
  template: `
    <app-match-form
      [mode]="mode"
      [tournamentId]="tournamentId()"
      [teams]="teams()"
      [sponsors]="sponsors()"
      [sponsorLines]="sponsorLines()"
      [loading]="loading()"
      (submit)="onSubmit($event)"
      (cancel)="cancel()"
    />
  `,
})
export class MatchCreateComponent {
  mode: MatchFormMode = 'create';

  teams = signal<Team[]>([]);
  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;
  loading = signal(false);

  onSubmit(data: MatchCreate | MatchUpdate): void {
    if (this.mode === 'create') {
      this.matchStore.createMatch(data as MatchCreate).subscribe(() => {
        this.cancel();
      });
    }
  }

  cancel(): void {
    this.navigationHelper.toTournamentDetail(sportId, year, tournamentId, 'matches');
  }
}
```

**Inputs:**

| Name | Type | Required | Default | Description |
|------|------|----------|----------|-------------|
| `mode` | `'create' \| 'edit'` | Yes | - | Form mode - create new or edit existing |
| `tournamentId` | `number \| null` | Yes | - | Tournament ID for the match |
| `teams` | `Team[]` | Yes | - | List of teams to select from |
| `sponsors` | `{ id: number; title?: string \| null }[]` | Yes | - | List of sponsors to select from |
| `sponsorLines` | `{ id: number; title?: string \| null }[]` | Yes | - | List of sponsor lines to select from |
| `match` | `MatchWithDetails \| null` | No | `null` | Match data for edit mode (populates form) |
| `loading` | `boolean` | No | `false` | Loading state for form |

**Outputs:**

| Name | Type | Description |
|------|------|-------------|
| `submit` | `EventEmitter<MatchCreate \| MatchUpdate>` | Emitted when form is submitted |
| `cancel` | `EventEmitter<void>` | Emitted when cancel button is clicked |

**Examples Used In:**
- Match create page (tournaments → matches → create)
- Match edit page (matches → edit)

**Mode-Specific Behavior:**

**Create Mode:**
- Title: "Create New Match"
- Submit button text: "Create Match"
- No match data loaded
- Form validation: all required fields

**Edit Mode:**
- Title: "Edit Match"
- Submit button text: "Save Changes"
- Form pre-populated with match data
- Context text shows: "TEAM A vs TEAM B"
- Updates existing match instead of creating new

**Best Practices:**
1. Parent component should handle navigation based on mode:
   - Create: Navigate back to tournament with matches tab
   - Edit: Navigate back to current match detail
2. Use `NavigationHelperService` for consistent navigation patterns
3. Team, sponsor, and sponsor line titles are automatically uppercase formatted
4. Loading state should be set during data fetching (teams loading in parent)
5. Use alert helpers (`withCreateAlert()`, `withUpdateAlert()`) for API calls

**Navigation Pattern:**

```typescript
// Cancel for create mode
cancel(): void {
  this.navigationHelper.toTournamentDetail(sportId, year, tournamentId, 'matches');
}

// Cancel for edit mode
cancel(): void {
  this.navigationHelper.toMatchDetail(sportId, matchId, year, tournamentId);
}
```

