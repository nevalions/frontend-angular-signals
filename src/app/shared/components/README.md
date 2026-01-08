# Shared Components

Reusable UI components used across the application.

## Components

### EntityHeaderComponent

**Location:** `src/app/shared/components/entity-header/`

A reusable header component for detail pages with back button, title, and settings menu.

**Features:**
- Back button with custom navigation callback
- Uppercase title display (automatically converts to uppercase)
- Gear menu with Edit/Delete actions (can be hidden)
- Support for custom menu items
- Responsive design - title truncates with ellipsis, buttons always visible
- Signal-based API
- Built with Taiga UI components

**Usage Example:**

```typescript
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-my-detail',
  standalone: true,
  imports: [EntityHeaderComponent],
  template: `
    <app-entity-header
      [title]="entityName"
      [navigateBack]="onBack"
      [showEdit]="true"
      [showDelete]="true"
      [customMenuItems]="menuItems"
      (edit)="onEdit()"
      (delete)="onDelete()"
      (customItemClick)="onCustomItemClick($event)"
    />
  `,
})
export class MyDetailComponent {
  entityName = 'My Entity';

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
2. Use `NavigationHelperService` for consistent navigation patterns
3. For delete operations, use `withDeleteConfirm()` utility for consistent UX
