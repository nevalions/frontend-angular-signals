# Component Patterns

This document covers component-specific patterns and requirements.

## Component Structure

All components are standalone with this pattern:

```typescript
@Component({
  selector: 'app-feature-name', // kebab-case, app prefix
  standalone: true, // Always standalone
  imports: [
    /* dependencies */
  ], // All imports listed
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush, // REQUIRED
})
export class FeatureNameComponent {
  // Component logic
}
```

### ❌ Missing Directive Imports - Critical Bug

**BAD - Directive used but not imported:**

```typescript
@Component({
  standalone: true,
  imports: [TuiAvatar, TuiIcon], // TuiButton missing!
  template: `
    <button tuiButton appearance="primary">Click me</button>
    <!-- Directive won't work - styling breaks -->
  `
})
export class BadComponent {}
```

**✅ GOOD - All template dependencies imported:**

```typescript
@Component({
  standalone: true,
  imports: [TuiButton, TuiAvatar, TuiIcon], // All directives imported
  template: `
    <button tuiButton appearance="primary">Click me</button>
    <!-- Directive works correctly -->
  `
})
export class GoodComponent {}
```

**Why this matters:**
- Missing directive imports cause subtle bugs that only appear on certain routes
- Direct navigation/refresh may break, but navigation from other routes works
- This happens because routes that import the directive make it temporarily available

**Rule:** ALWAYS import every directive, component, pipe, or module used in your template.

## Signal Inputs/Outputs

### Signal Inputs

```typescript
// Read-only signal input
seasonId = input.required<number>();

// Optional signal input with default
disabled = input(false);

// Signal output
seasonChange = output<Season>();

// Signal model for two-way binding
checked = model(false);
```

### View Queries

```typescript
import { viewChild, viewChildren, contentChild, contentChildren } from '@angular/core';

// Required view child
button = viewChild.required('button');

// Optional view child
container = viewChild<ElementRef>('container');

// Multiple view children
items = viewChildren(ItemComponent);

// Content projection
content = contentChild('content');
```

## Template Patterns

### Modern Control Flow

- Use `@if` instead of `*ngIf`
- Use `@for` instead of `*ngFor`
- Use `track` for list iteration

```html
<!-- GOOD - Modern control flow -->
@if (loading()) {
  <div>Loading...</div>
} @for (season of seasons(); track season.id) {
  <div>{{ season.year }}</div>
}
```

### Signal Bindings

```html
<!-- Direct signal binding -->
@if (loading()) {
  <div>Loading...</div>
} @for (season of seasons(); track season.id) {
  <div>{{ season.year }}</div>
}
```

### Class and Style Bindings

- Use `[class.name]` instead of `ngClass`
- Use `[style.property]` instead of `ngStyle`

```html
<!-- GOOD - Modern class binding -->
<div [class.active]="isActive()">{{ content }}</div>

<!-- BAD - Old ngClass -->
<div [ngClass]="{ active: isActive() }">{{ content }}</div>
```

## Component Organization

### Group Related Files Together

Components typically consist of one TypeScript file, one template file, and one style file. These files should share the same name with different file extensions.

Example for a `UserProfile` component:
- `user-profile.component.ts`
- `user-profile.component.html`
- `user-profile.component.less`

If a component has more than one style file, append name with additional words that describe the styles specific to that file.

Example:
- `user-profile-settings.less`
- `user-profile-subscription.less`

## Context-Based Component Patterns

### Multi-Context Entity Detail

When entities can be viewed from multiple contexts (e.g., team in sport vs team in tournament), use computed signals to provide context-specific behavior:

```typescript
// Detect context
isInTournamentContext = computed(() => this.tournamentId() !== null);

// Context-specific menu items
customMenuItems = computed<CustomMenuItem[]>(() => {
  if (this.isInTournamentContext()) {
    return [{ id: 'remove-from-tournament', label: 'Remove from tournament', type: 'danger' }];
  }
  return [];
});

// Conditional navigation
navigateBack(): void {
  if (this.isInTournamentContext()) {
    this.navigationHelper.toTournamentDetail(...);
  } else {
    this.navigationHelper.toSportDetail(...);
  }
}
```

See [EntityHeader README](../shared/components/entity-header/README.md) for complete pattern documentation.

## Taiga UI Dialog Patterns

### Basic Dialog Setup

Use `tuiDialog` from `@taiga-ui/core` to create dialog wrappers:

```typescript
import { tuiDialog } from '@taiga-ui/core';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({...})
export class SomeComponent {
  private readonly dialogs = inject(TuiDialogService);

  private readonly loginDialog = tuiDialog(LoginDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Sign In',
  });

  openLoginDialog(): void {
    this.loginDialog().subscribe();
  }
}
```

### Dialog Switching Pattern

When switching between dialogs (e.g., login ↔ signup), use `TuiDialogContext` to close the current dialog before opening the new one:

```typescript
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

@Component({...})
export class LoginDialogComponent {
  private readonly context = inject<TuiDialogContext<void, void>>(POLYMORPHEUS_CONTEXT);

  private readonly registerDialog = tuiDialog(RegisterDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Create Account',
  });

  openRegisterDialog(): void {
    // Close current dialog before opening new one
    this.context.completeWith();
    this.registerDialog().subscribe();
  }

  onSubmit(): void {
    // ... submit logic ...

    this.authService.login(credentials).subscribe({
      next: () => {
        // Close dialog on success
        this.context.completeWith();
        // Show alert...
      },
      error: (error) => {
        // Handle error...
      },
    });
  }
}
```

**Key Points:**
- Always use `this.context.completeWith()` before opening another dialog to prevent dialog stacking
- Call `completeWith()` on successful operations to close dialog automatically
- Import `TuiDialogContext` and `POLYMORPHEUS_CONTEXT` to access the dialog context

## Taiga UI Select (tuiSelect) Patterns

### Simple Select with String Values

Use `tuiSelect` for dropdowns where values are strings (e.g., role filter):

**Component:**
```typescript
import { FormsModule } from '@angular/forms';
import { TuiSelect, TuiTextfield, TuiDataList } from '@taiga-ui/core';

selectedRoleFilter = signal<string | null>(null);

onRoleFilterChange(roleName: string | null): void {
  this.selectedRoleFilter.set(roleName);
  this.usersCurrentPage.set(1); // Reset pagination on filter change
}
```

**Template:**
```html
<tui-textfield tuiChevron class="filter-select">
  <label tuiLabel>Filter by role</label>
  <input
    placeholder="All roles"
    tuiSelect
    [(ngModel)]="selectedRoleFilter" />
  <tui-data-list *tuiTextfieldDropdown>
    @for (role of roles(); track role.id) {
      <button new tuiOption type="button" [value]="role.name">
        {{ role.name }}
      </button>
    }
  </tui-data-list>
</tui-textfield>
```

**Required imports:**
- `FormsModule` for `[(ngModel)]` binding
- `TuiSelect`, `TuiTextfield`, `TuiDataList` from `@taiga-ui/core`

### Select with Custom Stringification

Use `[stringify]` to display custom labels when values are objects or need custom display:

**Component:**
```typescript
readonly onlineFilterOptions = [
  { label: 'All', value: 'all' as const },
  { label: 'Online', value: 'online' as const },
  { label: 'Offline', value: 'offline' as const },
];

selectedOnlineFilter = signal<'all' | 'online' | 'offline'>('all');

onOnlineFilterChange(onlineStatus: 'all' | 'online' | 'offline'): void {
  this.selectedOnlineFilter.set(onlineStatus);
  this.usersCurrentPage.set(1);
}

stringifyOnlineFilter(status: 'all' | 'online' | 'offline'): string {
  if (!status) return '';
  const option = this.onlineFilterOptions.find(o => o.value === status);
  return option ? option.label : '';
}
```

**Template:**
```html
<tui-textfield tuiChevron [stringify]="stringifyOnlineFilter" class="filter-select">
  <label tuiLabel>Filter by status</label>
  <input
    placeholder="All"
    tuiSelect
    [(ngModel)]="selectedOnlineFilter" />
  <tui-data-list *tuiTextfieldDropdown>
    @for (option of onlineFilterOptions; track option.value) {
      <button new tuiOption type="button" [value]="option.value">
        {{ option.label }}
      </button>
    }
  </tui-data-list>
</tui-textfield>
```

**Key Points:**
- Bind `[stringify]` to a method that converts the value to display string
- Use `as const` for literal union types to maintain type safety
- The stringify function should handle null/undefined cases

### Signal Integration with Effects

Use `effect()` to trigger data loading when filter values change:

```typescript
constructor() {
  this.stringifyOnlineFilter = this.stringifyOnlineFilter.bind(this);

  effect(() => {
    const roleFilter = this.selectedRoleFilter();
    if (roleFilter !== undefined) {
      this.loadUsers(); // Load data when filter changes
    }
  });

  effect(() => {
    const onlineFilter = this.selectedOnlineFilter();
    if (onlineFilter !== undefined) {
      this.loadUsers();
    }
  });
}
```

**Best Practices:**
- Always reset pagination to page 1 when filters change
- Use `null` or specific placeholder values to indicate "no filter"
- Track options by a unique property (`track role.id`, `track option.value`)
- Import ALL Taiga UI directives used in template to avoid bugs (see above)

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal-based patterns
- [Template Requirements](./template-requirements.md) - Template best practices
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
