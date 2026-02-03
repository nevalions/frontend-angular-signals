# Alert Pattern

Canonical pattern for user feedback using alert helpers.

## Alert Helper Patterns

All CRUD operations use utility functions from `src/app/core/utils/alert-helper.util.ts` for consistent UX.

## Create Pattern (withCreateAlert)

```typescript
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';

@Component({ ... })
export class ExampleComponent {
  private alerts = inject(TuiAlertService);

  createEntity(data: EntityCreate): void {
    withCreateAlert(
      this.alerts,
      () => this.store.createEntity(data),
      () => this.onCreateSuccess(),
      'Entity'
    );
  }

  onCreateSuccess(): void {
    // Reset form, navigate, etc.
  }
}
```

## Update Pattern (withUpdateAlert)

```typescript
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';

@Component({ ... })
export class ExampleComponent {
  private alerts = inject(TuiAlertService);

  updateEntity(id: number, data: EntityUpdate): void {
    withUpdateAlert(
      this.alerts,
      () => this.store.updateEntity(id, data),
      () => this.onUpdateSuccess(),
      'Entity'
    );
  }

  onUpdateSuccess(): void {
    // Reset form, navigate, etc.
  }
}
```

## Delete Confirmation Pattern (withDeleteConfirm)

```typescript
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

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

## Acknowledgement Confirmation Dialog

Use a custom dialog with a required checkbox when the user must explicitly acknowledge a destructive or multi-entity action (for example, moving a tournament and related records).

```typescript
import { tuiDialog } from '@taiga-ui/core';
import { TournamentMoveDialogComponent, type TournamentMoveDialogData } from '../components/edit/tournament-move-dialog.component';

private readonly moveDialog = tuiDialog(TournamentMoveDialogComponent, {
  size: 'm',
  dismissible: true,
  label: 'Move Tournament to Another Sport',
}) as unknown as (data: TournamentMoveDialogData) => Observable<boolean>;

this.moveDialog({
  content: 'Summary of what will change',
  confirmLabel: 'Confirm Move',
  confirmText: 'I understand this will move the tournament and related data to another sport.',
}).subscribe((confirmed) => {
  if (!confirmed) return;
  // Execute operation
});
```

## Benefits

- ✅ Consistent UX across all CRUD operations
- ✅ Automatic success/error alerts
- ✅ Reusable and maintainable
- ✅ Type-safe with generics
- ✅ Single source of truth for alert handling

## Behavior

### Create/Update

- Executes operation immediately
- On success: Shows positive alert with 3s auto-close
- On error: Shows negative alert (stays open until user closes)
- Calls `onSuccess()` callback after successful operation

### Delete

- Shows Taiga UI confirm dialog with `appearance: 'error'`
- On confirmation: executes delete operation
- On success: Shows positive alert with 3s auto-close, then calls `onSuccess()`
- On error: Shows negative alert (stays open until user closes)
- On cancel: Closes dialog, no action taken

## Import Requirements

```typescript
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { withCreateAlert, withUpdateAlert, withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
```

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Component patterns
- [Service Patterns](./service-patterns.md) - Service patterns
- [Navigation Pattern](./navigation-patterns.md) - Navigation after operations
