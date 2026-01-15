# EntityHeaderComponent

Shared header component for detail pages with back navigation, edit, delete, and custom menu items.

## Features

- Back button navigation
- Edit button
- Delete button
- Custom menu items support
- Conditional visibility controls
- Responsive design

## Usage

### Basic Usage

```html
<app-entity-header
  [title]="team.title"
  (navigateBack)="navigateBack()"
  (edit)="onEdit()"
  (delete)="onDelete()"
/>
```

### Conditional Buttons

Hide edit or delete buttons:

```html
<app-entity-header
  [title]="team.title"
  [showEdit]="false"
  [showDelete]="false"
  (navigateBack)="navigateBack()"
/>
```

### Custom Menu Items

Add context-specific menu items:

```typescript
customMenuItems = computed<CustomMenuItem[]>(() => {
  if (this.isInTournamentContext()) {
    return [{ 
      id: 'remove-from-tournament', 
      label: 'Remove from tournament', 
      type: 'danger', 
      icon: '@tui.trash' 
    }];
  }
  return [];
});
```

```html
<app-entity-header
  [title]="team.title"
  [customMenuItems]="customMenuItems()"
  (navigateBack)="navigateBack()"
  (edit)="onEdit()"
  (delete)="onDelete()"
  (customItemClick)="onCustomItemClick($event)"
/>
```

## Context-Based Menu Pattern

### Overview

When an entity can be viewed from multiple contexts (e.g., team in sport vs team in tournament), use conditional menu items to show context-specific actions.

### Implementation Steps

1. **Detect Context** - Create computed property to check current context:

```typescript
isInTournamentContext = computed(() => {
  const tournamentId = this.route.snapshot.paramMap.get('id');
  return tournamentId !== null;
});
```

2. **Create Custom Menu Items** - Define menu items conditionally:

```typescript
customMenuItems = computed<CustomMenuItem[]>(() => {
  if (this.isInTournamentContext()) {
    return [{ 
      id: 'remove-from-tournament', 
      label: 'Remove from tournament', 
      type: 'danger',
      icon: '@tui.trash' 
    }];
  }
  return [];
});
```

3. **Hide Default Actions** - Conditionally hide standard actions:

```html
<app-entity-header
  [showDelete]="!isInTournamentContext()"
  [customMenuItems]="customMenuItems()"
  (customItemClick)="onCustomItemClick($event)"
/>
```

4. **Handle Custom Actions** - Implement custom action handler:

```typescript
onCustomItemClick(itemId: string): void {
  if (itemId === 'remove-from-tournament') {
    const team = this.team();
    const tournamentId = this.tournamentId();
    const teamId = this.teamId();
    if (!team || !tournamentId || !teamId) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Remove team "${team.title}" from tournament?`,
        content: 'This action cannot be undone!',
      },
      () => this.teamStore.removeTeamFromTournament(tournamentId, teamId),
      () => this.navigateToSportDetail(),
      'Team'
    );
  }
}
```

### Navigation Pattern

Navigate back to the correct context:

```typescript
navigateToSportDetail(): void {
  const sportId = this.sportId();
  const year = this.route.snapshot.queryParamMap.get('year');
  const tournamentId = this.tournamentId();
  const tournamentYear = this.year();

  if (this.isInTournamentContext() && sportId && tournamentYear && tournamentId) {
    // Go back to tournament detail
    this.navigationHelper.toTournamentDetail(sportId, tournamentYear, tournamentId, 'teams');
  } else if (sportId) {
    // Go back to sport detail
    this.navigationHelper.toSportDetail(sportId, year ? Number(year) : undefined, 'teams');
  }
}
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Entity title |
| `showEdit` | `boolean` | `true` | Show edit button |
| `showDelete` | `boolean` | `true` | Show delete button |
| `customMenuItems` | `CustomMenuItem[]` | `[]` | Custom menu items |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `navigateBack` | `void` | Back button clicked |
| `edit` | `void` | Edit button clicked |
| `delete` | `void` | Delete button clicked |
| `customItemClick` | `string` | Custom item ID clicked |

### CustomMenuItem Interface

```typescript
export interface CustomMenuItem {
  id: string;                    // Unique identifier
  label: string;                 // Display text
  icon?: string;                 // Optional icon (Taiga UI icon name)
  type?: 'default' | 'danger';   // Optional style type
}
```

## Related Documentation

- [Alert Pattern](../../docs/alert-patterns.md) - Alert helpers
- [Navigation Pattern](../../docs/navigation-patterns.md) - Navigation helpers
