# UI Patterns - Reusable Component Patterns

This document documents reusable UI patterns and implementation details for future reference.

## Table of Contents

1. [ComboBox with Search Pattern](#combobox-with-search-pattern)
2. [Delete Confirmation Pattern](#delete-confirmation-pattern)
3. [Navigation Helper Pattern](#navigation-helper-pattern)
4. [Alert/Success Pattern](#alertsuccess-pattern)
5. [Entity Header Pattern](#entity-header-pattern)
6. [Loading States Pattern](#loading-states-pattern)
7. [Static Asset URL Pattern](#static-asset-url-pattern)
8. [Form Validation Pattern](#form-validation-pattern)

---

## ComboBox with Search Pattern

### When to Use
- Select from a large list of items that can be filtered by typing
- Search functionality required within dropdown
- Single selection from filtered results

### Implementation

#### TypeScript Component

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield, TuiButton, TuiAlertService, TuiDataList } from '@taiga-ui/core';
import { TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiButton,
    TuiDataList,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe,
  ],
  templateUrl: './example.component.html',
  styleUrl: './example.component.less',
})
export class ExampleComponent {
  // Store whole object, not just ID, for proper stringify
  selectedItem = signal<Item | null>(null);

  items = signal<Item[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Important: Create local function to avoid 'this is undefined' error
  stringifyItem(item: Item): string {
    const formatField = (value: string | null): string => {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };
    return `${formatField(item.field1)} ${formatField(item.field2)}`;
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getItems().pipe(
      tap((response) => {
        this.items.set(response.data ?? []);
        this.loading.set(false);
      }),
      catchError((_err) => {
        this.error.set('Failed to load items');
        this.loading.set(false);
        this.items.set([]);
        return EMPTY;
      })
    ).subscribe();
  }
}
```

#### Template (HTML)

```html
<tui-textfield
  tuiChevron
  iconStart="@tui.search"
  [stringify]="stringifyItem"
  tuiTextfieldSize="m">
  <label tuiLabel>Select Item</label>
  <input
    placeholder="Search and select..."
    tuiComboBox
    [(ngModel)]="selectedItem"
    [disabled]="loading()" />
  <tui-data-list *tuiTextfieldDropdown size="l">
    @if (loading()) {
      <div class="dropdown-loading">Loading...</div>
    } @else if (error()) {
      <div class="dropdown-error">{{ error() }}</div>
    } @else if (items().length === 0) {
      <div class="dropdown-empty">No items available</div>
    } @else {
      @for (item of items() | tuiFilterByInput; track item.id) {
        <button
          new
          tuiOption
          type="button"
          [value]="item"
          class="dropdown-option">
          {{ formatItem(item) }}
        </button>
      }
    }
  </tui-data-list>
</tui-textfield>
```

#### Styles (LESS)

```less
.dropdown-loading,
.dropdown-error,
.dropdown-empty {
  padding: 1rem;
  text-align: center;
  color: var(--tui-text-secondary);
  font-style: italic;
}

.dropdown-error {
  color: var(--tui-text-negative);
}

.dropdown-option {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
}
```

### Key Implementation Details

1. **Store Whole Object**: Use `selectedItem = signal<Item | null>(null)` not `selectedItemId = signal<number | null>(null)`
   - Required for `stringify` function to access item properties
   - Dropdown value must match the object, not just an ID

2. **Stringify Function**: Provide `[stringify]="stringifyItem"` to `tui-textfield`
   - Formats how selected item displays in the textfield
   - Must be a function that takes the item object and returns a string

3. **Context Preservation**: Create local arrow functions inside `stringifyItem`
   ```typescript
   stringifyItem(item: Item): string {
     const localHelper = (value: string | null): string => { ... };
     return `${localHelper(item.field1)} ${localHelper(item.field2)}`;
   }
   ```
   - Avoids `this is undefined` error when callback loses context
   - Don't use `this.someMethod()` inside stringify function

4. **Dropdown Value**: Use `[value]="item"` (whole object) in `tuiOption`
   - Must match `selectedItem` type (object, not ID)
   - Enables proper selection and display

5. **Filtering**: Use `tuiFilterByInput` pipe on items array
   - Client-side filtering as user types
   - No need to call backend on every keystroke
   - For server-side filtering, use RxJS with `debounceTime` and `switchMap`

6. **Loading States**: Show inline loading/error/empty states in dropdown
   - Use `@if` directives for conditional rendering
   - Helpful for UX during async data loading

### Server-Side Filtering (Advanced)

For large datasets where client-side filtering isn't performant:

```typescript
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

export class ExampleComponent {
  private search$ = new Subject<string>();

  filteredItems$ = this.search$.pipe(
    debounceTime(300),
    switchMap((query) => this.service.searchItems(query))
  );

  onSearchInput(event: Event): void {
    const query = ($any(event.target) as HTMLInputElement).value;
    this.search$.next(query);
  }
}
```

```html
<tui-textfield tuiChevron>
  <input
    tuiComboBox
    [(ngModel)]="selectedItem"
    (input)="onSearchInput($event)" />
  <tui-data-list *tuiTextfieldDropdown>
    @if (filteredItems$ | async as items) {
      @for (item of items; track item.id) {
        <button new tuiOption [value]="item">{{ item.name }}</button>
      }
    }
  </tui-data-list>
</tui-textfield>
```

### Reference Implementation

**File**: `src/app/features/sports/components/detail/tabs/sport-players-tab.component.ts`

This pattern was used to implement the "Add Player" dropdown with person search.

### Related Taiga UI Components

- [ComboBox](https://taiga-ui.dev/components/ComboBox) - Main searchable dropdown component
- [Select](https://taiga-ui.dev/components/Select) - Non-searchable dropdown (use when no search needed)
- [Textfield](https://taiga-ui.dev/components/Textfield) - Underlying text input component

---

## Delete Confirmation Pattern

Use `withDeleteConfirm()` utility for consistent delete operations across the application.

### When to Use

- Any delete operation that should confirm with user
- Operations that cannot be undone
- When you need success/error alerts and navigation

### Implementation

#### TypeScript Component

```typescript
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { withDeleteConfirm } from '../../../../core/utils/delete-helper.util';

@Component({ ... })
export class ExampleComponent {
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  deleteEntity(): void {
    const entity = this.entity();
    const id = entity?.id;
    if (!entity || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete ${entity.name}?`,
        content: 'This action cannot be undone!',
      },
      () => this.store.deleteEntity(id),
      () => this.navigateBack(),
      'Entity'
    );
  }
}
```

#### Utility Function

Located in: `src/app/core/utils/delete-helper.util.ts`

```typescript
export function withDeleteConfirm<T>(
  dialogs: TuiDialogService,
  alerts: TuiAlertService,
  confirmConfig: {
    label: string;
    content: string;
  },
  deleteOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void {
  dialogs
    .open<boolean>(TUI_CONFIRM, {
      label: confirmConfig.label,
      size: 's',
      data: {
        content: confirmConfig.content,
        yes: 'Delete',
        no: 'Cancel',
        appearance: 'error',
      },
    })
    .pipe(
      switchMap((confirmed) => {
        if (!confirmed) return EMPTY;
        return deleteOperation().pipe(
          tap(() => {
            alerts.open(`${entityType} deleted successfully`, {
              label: 'Success',
              appearance: 'positive',
              autoClose: 3000
            }).subscribe();
          }),
          catchError((err) => {
            alerts.open(`Failed to delete: ${err.message || 'Unknown error'}`, {
              label: 'Error',
              appearance: 'negative',
              autoClose: 0
            }).subscribe();
            return throwError(() => err);
          })
        );
      })
    )
    .subscribe({
      next: onSuccess,
    });
}
```

### Key Implementation Details

1. **Confirmation Dialog**: Uses `TUI_CONFIRM` from `@taiga-ui/kit`
2. **Error Appearance**: Dialog has `appearance: 'error'` for destructive actions
3. **Success Alert**: Positive appearance with 3s auto-close
4. **Error Alert**: Negative appearance, stays open (autoClose: 0) until user closes
5. **Navigation**: Only happens on success, not on error
6. **Type Safety**: Generic type parameter `<T>` for type-safe operations

### Benefits

- ✅ Consistent UX across all delete operations
- ✅ Automatic success/error alerts
- ✅ Confirmation dialog with destructive appearance
- ✅ Reusable and maintainable
- ✅ Type-safe with generics

### Reference Implementation

**File**: `src/app/features/sports/components/detail/sport-detail.component.ts`

---

## Navigation Helper Pattern

Use `NavigationHelperService` for common navigation routes to avoid repetition.

### When to Use

- Any component that needs to navigate to standard entity pages
- When navigation logic is repeated across multiple components
- Navigation after CRUD operations (create, update, delete)

### Implementation

```typescript
import { NavigationHelperService } from '../../../shared/services/navigation-helper.service';

@Component({ ... })
export class ExampleComponent {
  private navigationHelper = inject(NavigationHelperService);

  cancel(): void {
    this.navigationHelper.toTournamentsList(this.sportId, this.year);
  }

  onSubmit(): void {
    this.service.save().subscribe(() => {
      this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
    });
  }
}
```

### Available Methods

```typescript
// Tournaments
toTournamentsList(sportId: number | string, year: number | string)
toTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string)
toTournamentEdit(sportId: number | string, year: number | string, tournamentId: number | string)
toTournamentCreate(sportId: number | string, year: number | string)

// Sports
toSportDetail(sportId: number | string, year?: number | string, tab?: string)
toSportEdit(sportId: number | string)
toSportsList()

// Teams
toTeamDetail(sportId: number | string, teamId: number | string, year?: number | string)
toTeamEdit(sportId: number | string, teamId: number | string)
toTeamCreate(sportId: number | string)

// Persons
toPersonsList()
toPersonDetail(id: number | string)
toPersonEdit(id: number | string)
toPersonCreate()

// System
toHome()
toError404()
```

### Benefits

- ✅ Single source of truth for all navigation routes
- ✅ Consistent navigation behavior across app
- ✅ Reduces code duplication
- ✅ Easy to update routes in one place

---

## Alert/Success Pattern

Use alert utilities for consistent success/error feedback after operations.

### Available Utilities

Located in: `src/app/core/utils/delete-helper.util.ts`

```typescript
export function withCreateAlert<T>(
  alerts: TuiAlertService,
  createOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void

export function withUpdateAlert<T>(
  alerts: TuiAlertService,
  updateOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void

export function withDeleteConfirm<T>(
  dialogs: TuiDialogService,
  alerts: TuiAlertService,
  confirmConfig: { label: string; content: string },
  deleteOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void
```

### Implementation Example

```typescript
@Component({ ... })
export class ExampleComponent {
  private alerts = inject(TuiAlertService);

  createEntity(): void {
    withCreateAlert(
      this.alerts,
      () => this.store.create(data),
      () => this.navigateBack(),
      'Entity'
    );
  }
}
```

### Alert Options

```typescript
alerts.open('Message', {
  label: 'Success',           // Alert title
  appearance: 'positive',       // positive, negative, or neutral
  autoClose: 3000,            // Auto-close in milliseconds (0 = never auto-close)
}).subscribe();
```

---

## Entity Header Pattern

Use `EntityHeaderComponent` for detail pages with title, edit, and delete actions.

### When to Use

- Detail pages for any entity (season, tournament, team, person, etc.)
- Pages with title, navigation back, edit, and delete actions

### Implementation

```typescript
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-entity-detail',
  standalone: true,
  imports: [EntityHeaderComponent],
  templateUrl: './entity-detail.component.html',
})
export class EntityDetailComponent {
  entity = computed(() => this.store.currentEntity());

  navigateBack(): void {
    this.navigationHelper.toEntityList();
  }

  navigateToEdit(): void {
    const id = this.entity()?.id;
    if (id) {
      this.navigationHelper.toEntityEdit(id);
    }
  }

  deleteEntity(): void {
    const entity = this.entity();
    if (!entity) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      { label: `Delete ${entity.title}?`, content: 'This action cannot be undone!' },
      () => this.store.deleteEntity(entity.id),
      () => this.navigateBack(),
      'Entity'
    );
  }
}
```

### Template Usage

```html
<app-entity-header
  [title]="entity().title"
  (navigateBack)="navigateBack()"
  (edit)="navigateToEdit()"
  (delete)="deleteEntity()" />
```

### Reference Implementation

**File**: `src/app/shared/components/entity-header/entity-header.component.ts`

---

## Loading States Pattern

Consistent loading, error, and empty state handling for lists and data fetching.

### When to Use

- Any component that fetches data asynchronously
- Lists, forms, or detail pages with async operations
- Resource-based data fetching (httpResource, rxResource)

### Implementation

```typescript
@Component({ ... })
export class ExampleComponent {
  private store = inject(ExampleStoreService);

  // Expose store signals as component properties
  items = this.store.items;
  loading = computed(() => this.store.loading());
  error = computed(() => this.store.error());
}
```

### Template Usage

```html
@if (loading()) {
  <div class="loading">Loading...</div>
} @else if (error()) {
  <div class="error">{{ error() }}</div>
} @else if (items().length === 0) {
  <p class="empty">No items found</p>
} @else {
  <div class="items">
    @for (item of items(); track item.id) {
      <app-item-card [item]="item" />
    }
  </div>
}
```

### Key States

1. **Loading State**: Show spinner or loading message
2. **Error State**: Display error message with retry option
3. **Empty State**: Friendly message when no data exists
4. **Success State**: Render data normally

### Best Practices

- Use computed signals for loading/error state
- Expose as simple properties from store
- Provide visual feedback during async operations
- Clear error messages when retry succeeds

---

## Static Asset URL Pattern

Use `buildStaticUrl()` for all static asset URLs (images, logos, photos).

### When to Use

- Displaying team logos
- Showing person photos
- Any static file from the backend

### Implementation

```typescript
import { buildStaticUrl } from '../../../core/config/api.constants';

@Component({ ... })
export class ExampleComponent {
  teamLogoUrl(team: Team): string | null {
    return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
  }

  personPhotoUrl(person: Person): string | null {
    return person.person_photo_url ? buildStaticUrl(person.person_photo_url) : null;
  }
}
```

### Template Usage

```html
<!-- BAD - Direct URL binding -->
<img [src]="team.team_logo_url" [alt]="team.title" />

<!-- GOOD - Using buildStaticUrl -->
@if (teamLogoUrl(team); as logoUrl) {
  <img [src]="logoUrl" [alt]="team.title" />
} @else {
  <div class="placeholder">No logo</div>
}
```

### Why Use This Pattern

- ✅ Handles CDN URL configuration in one place
- ✅ Easy to update asset URL structure globally
- ✅ Prevents hardcoded URLs throughout app
- ✅ Enables fallbacks and error handling centrally

---

## Form Validation Pattern

Use traditional Reactive Forms with validators for consistent form validation.

### When to Use

- Create and edit forms for entities
- Any form with validation requirements
- When using `@angular/forms` (NOT signal forms)

### Implementation

```typescript
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
})
export class FormComponent {
  private fb = inject(FormBuilder);

  seasonForm = this.fb.group({
    year: ['', [Validators.required, Validators.min(1900)]],
    description: [''],
  });

  onSubmit(): void {
    if (this.seasonForm.invalid) {
      return;
    }

    this.store.create(this.seasonForm.value).subscribe();
  }
}
```

### Template Usage

```html
<form [formGroup]="seasonForm" (ngSubmit)="onSubmit()">
  <input formControlName="year" placeholder="Year" />
  @if (seasonForm.get('year')?.errors?.required) {
    <div class="error">Year is required</div>
  }
  @if (seasonForm.get('year')?.errors?.min) {
    <div class="error">Year must be at least 1900</div>
  }

  <input formControlName="description" placeholder="Description" />

  <button type="submit" [disabled]="seasonForm.invalid">Submit</button>
</form>
```

### Key Validators

```typescript
import { Validators } from '@angular/forms';

Validators.required           // Field is required
Validators.minLength(n)          // Minimum length
Validators.maxLength(n)          // Maximum length
Validators.min(value)           // Minimum numeric value
Validators.max(value)           // Maximum numeric value
Validators.email               // Must be valid email
Validators.pattern(regex)        // Must match regex pattern
```

### ⚠️ IMPORTANT - DO NOT use Signal Forms

- Signal Forms (`form()` from `@angular/forms/signals`) are in BETA
- Use traditional Reactive Forms (`FormBuilder`, `FormGroup`, `FormControl`)
- Signal Forms may have breaking changes in future releases
- Use `Validators.required`, `Validators.min` etc. from `@angular/forms`

---

## Additional Resources

### Taiga UI Documentation

- [ComboBox](https://taiga-ui.dev/components/ComboBox) - Searchable dropdown
- [Select](https://taiga-ui.dev/components/Select) - Standard dropdown
- [Textfield](https://taiga-ui.dev/components/Textfield) - Text input fields
- [Button](https://taiga-ui.dev/components/Button) - Button components
- [Dialog](https://taiga-ui.dev/components/Dialog) - Modal dialogs
- [Alert](https://taiga-ui.dev/components/Alert) - Toast notifications

### Angular Documentation

Use MCP tools for accessing official Angular docs:

```typescript
angular - cli_search_documentation({
  query: 'standalone components',
  includeTopContent: true,
  version: 21,
});
```

### Project-Specific Documentation

- `AGENTS.md` - Full development guidelines and best practices
- `README.md` - Project setup and commands
- `FEATURES_POSITIONS.md` - Positions feature documentation