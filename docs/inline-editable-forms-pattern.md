# Inline Editable Forms Pattern

Canonical pattern for inline editing with edit/save/cancel icons.

## Overview

This pattern provides a clean UX for editing individual fields without leaving the page context. Each field has three states:
1. **View mode**: Shows value with edit icon
2. **Edit mode**: Shows editable field with save/cancel icons
3. **Saving**: Shows loading state during save operation

## Component Structure

### Signal-based State Management

```typescript
import { Component, signal, inject } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiIcon, TuiTextfield, TuiComboBox } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-inline-edit-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiIcon,
    TuiTextfield,
    TuiComboBox,
    // ... other imports
  ],
  templateUrl: './inline-edit-example.component.html',
  styleUrl: './inline-edit-example.component.less',
})
export class InlineEditExampleComponent {
  private alerts = inject(TuiAlertService);

  // Edit mode signals for each field
  editingField = signal(false);

  // Current value signals
  editedValue = signal<string | null>(null);

  // Temporary value for cancel
  tempValue = signal<string | null>(null);

  // Available options for dropdown fields
  options = signal<OptionType[]>([]);
}
```

## Template Pattern

### Text Field (Inline Edit)

```html
<div class="field-row">
  <label class="field-label">Field Name</label>

  @if (!editingField()) {
    <!-- View mode: Show value with edit icon -->
    <div class="field-value">
      <span class="value">{{ editedValue() || 'No value' }}</span>
      <button
        type="button"
        class="edit-button"
        (click)="startEdit()">
        <tui-icon icon="@tui.pencil" />
      </button>
    </div>
  } @else {
    <!-- Edit mode: Show input with save/cancel icons -->
    <div class="field-edit">
      <tui-textfield tuiTextfieldSize="m">
        <label tuiLabel>Field name</label>
        <input
          placeholder="Enter value"
          tuiTextfield
          [(ngModel)]="editedValue" />
      </tui-textfield>
      <div class="field-actions">
        <button
          type="button"
          class="action-button save-button"
          (click)="saveField()">
          <tui-icon icon="@tui.check" />
        </button>
        <button
          type="button"
          class="action-button cancel-button"
          (click)="cancelEdit()">
          <tui-icon icon="@tui.x" />
        </button>
      </div>
    </div>
  }
</div>
```

### Dropdown Field (Inline Edit)

```html
<div class="field-row">
  <label class="field-label">Team</label>

  @if (!editingTeam()) {
    <!-- View mode: Show team name with edit icon -->
    <div class="field-value">
      <span class="value">{{ getTeamName(editedTeamId()) }}</span>
      <button
        type="button"
        class="edit-button"
        (click)="startEditTeam()">
        <tui-icon icon="@tui.pencil" />
      </button>
    </div>
  } @else {
    <!-- Edit mode: Show dropdown with save/cancel icons -->
    <div class="field-edit">
      <tui-textfield
        tuiChevron
        [stringify]="stringifyOption"
        tuiTextfieldSize="m">
        <label tuiLabel>Select option</label>
        <input
          placeholder="No selection"
          tuiComboBox
          [(ngModel)]="editedTeamId"
          [disabled]="loadingOptions()" />
        <tui-data-list *tuiTextfieldDropdown>
          @for (option of options() | tuiFilterByInput; track option.id) {
            <button
              new
              tuiOption
              type="button"
              [value]="option.id"
              class="option">
              {{ stringifyOption(option) }}
            </button>
          }
        </tui-data-list>
      </tui-textfield>
      <div class="field-actions">
        <button
          type="button"
          class="action-button save-button"
          (click)="saveTeam()">
          <tui-icon icon="@tui.check" />
        </button>
        <button
          type="button"
          class="action-button cancel-button"
          (click)="cancelEditTeam()">
          <tui-icon icon="@tui.x" />
        </button>
      </div>
    </div>
  }
</div>
```

## Component Methods

### Start Edit

```typescript
startEdit(): void {
  // Store current value for potential cancel
  this.tempValue.set(this.editedValue());
  // Enable edit mode
  this.editingField.set(true);
}

startEditTeam(): void {
  // Ensure only one field is edited at a time
  this.cancelAllEdits();
  // Store current value for potential cancel
  this.tempTeamId.set(this.editedTeamId());
  // Enable edit mode
  this.editingTeam.set(true);
}
```

### Save Field

```typescript
saveField(): void {
  withUpdateAlert(
    this.alerts,
    () => this.store.updateField({
      value: this.editedValue(),
    }),
    () => {
      // On success: update local state
      this.editingField.set(false);
    },
    'Field'
  );
}

saveTeam(): void {
  withUpdateAlert(
    this.alerts,
    () => this.store.updateTeamAssignment({
      team_id: this.editedTeamId(),
    }),
    () => {
      // On success: update local state
      this.editingTeam.set(false);
      this.loadPlayer(); // Refresh data
    },
    'Team assignment'
  );
}
```

### Cancel Edit

```typescript
cancelEdit(): void {
  // Restore original value
  this.editedValue.set(this.tempValue());
  // Exit edit mode
  this.editingField.set(false);
}

cancelEditTeam(): void {
  // Restore original value
  this.editedTeamId.set(this.tempTeamId());
  // Exit edit mode
  this.editingTeam.set(false);
}
```

### Helper Methods

```typescript
// Stringify for dropdown display
stringifyOption(option: OptionType): string {
  return option.title || `Option #${option.id}`;
}

// Get display name from ID
getTeamName(teamId: number | null): string {
  const team = this.teams().find(t => t.id === teamId);
  return team?.title || 'No team';
}

// Cancel all edits (ensure single field editing)
cancelAllEdits(): void {
  this.editingField.set(false);
  this.editingTeam.set(false);
  this.editingPosition.set(false);
}
```

## Styling Pattern

```less
.field-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  &__label {
    font-weight: 600;
    color: var(--tui-text-primary);
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 12px;

    .value {
      font-size: 14px;
      color: var(--tui-text-primary);
    }

    .edit-button {
      opacity: 0;
      transition: opacity 0.2s ease;
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px;

      .field-row:hover & {
        opacity: 1;
      }
    }
  }

  &__edit {
    display: flex;
    align-items: center;
    gap: 12px;

    .field-actions {
      display: flex;
      gap: 8px;

      .action-button {
        border: none;
        background: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: var(--tui-background-neutral-1);
        }

        &.save-button {
          color: var(--tui-positive);
        }

        &.cancel-button {
          color: var(--tui-negative);
        }
      }
    }
  }
}
```

## Icons

Use these Taiga UI icons for inline editing:

- **Edit**: `@tui.pencil`
- **Save**: `@tui.check`
- **Cancel**: `@tui.x`

❌ **Do not use**: `@tui.close` (doesn't exist - causes 404)

## Best Practices

### 1. Single Field Editing

Only allow one field to be edited at a time:

```typescript
startEditField(): void {
  this.cancelAllEdits(); // Cancel any other active edits
  this.tempValue.set(this.editedValue());
  this.editingField.set(true);
}
```

### 2. Cancel with Original Value

Always store and restore original value on cancel:

```typescript
startEdit(): void {
  this.tempValue.set(this.editedValue()); // Store for cancel
  this.editingField.set(true);
}

cancelEdit(): void {
  this.editedValue.set(this.tempValue()); // Restore
  this.editingField.set(false);
}
```

### 3. Use Alert Helpers

Always use `withUpdateAlert` for save operations:

```typescript
saveField(): void {
  withUpdateAlert(
    this.alerts,
    () => this.store.updateField({ value: this.editedValue() }),
    () => this.editingField.set(false),
    'Field'
  );
}
```

### 4. Hover to Show Edit Icon

Show edit icon on hover for cleaner UI:

```less
.edit-button {
  opacity: 0;
  transition: opacity 0.2s ease;

  .field-row:hover & {
    opacity: 1; // Show on hover
  }
}
```

## Complete Example

### Refactored Player Detail (current structure)

The player detail component has been refactored to use smaller, focused components:

- `src/app/features/players/components/detail/player-detail.component.ts` - Parent component
- `src/app/features/players/components/detail/player-detail.component.html` - Template
- `src/app/features/players/components/detail/player-detail.component.less` - Styles
- `src/app/features/players/components/detail/player-display.util.ts` - Type-safe player data helpers
- `src/app/features/players/components/detail/tournament-assignment/tournament-assignment.component.ts` - Inline-edit UI component
- `src/app/features/players/components/detail/tournament-assignment/tournament-assignment.component.html` - Template
- `src/app/features/players/components/detail/tournament-assignment/tournament-assignment.component.less` - Styles

### TournamentAssignmentComponent

The `TournamentAssignmentComponent` demonstrates the inline editable forms pattern:

- Team dropdown with inline edit/save/cancel
- Player number text field with inline edit/save/cancel
- Position dropdown with inline edit/save/cancel
- Uses `@Input()` with `init()` method for parent-child communication
- Loads tournament teams and sport positions via store services

## Related Documentation

- [Alert Pattern](./alert-patterns.md) - Alert helpers for CRUD operations
- [Component Patterns](./component-patterns.md) - Component structure and patterns
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal-based patterns
