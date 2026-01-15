# UI Patterns - Reusable Component Patterns

This document documents reusable UI patterns and implementation details for future reference.

## ComboBox with Search Pattern

A searchable dropdown using Taiga UI's `TuiComboBox` with client-side filtering via `tuiFilterByInput` pipe.

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
