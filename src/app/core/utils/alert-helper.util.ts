import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';

export function withCreateAlert<T>(
  alerts: TuiAlertService,
  createOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void {
  createOperation()
    .pipe(
      tap(() => {
        alerts.open(`${entityType} created successfully`, {
          label: 'Success',
          appearance: 'positive',
          autoClose: 3000,
        }).subscribe();
      }),
      catchError((err) => {
        alerts.open(`Failed to create: ${err.message || 'Unknown error'}`, {
          label: 'Error',
          appearance: 'negative',
          autoClose: 0,
        }).subscribe();
        return throwError(() => err);
      })
    )
    .subscribe({
      next: onSuccess,
    });
}

export function withUpdateAlert<T>(
  alerts: TuiAlertService,
  updateOperation: () => Observable<T>,
  onSuccess: () => void,
  entityType: string,
): void {
  updateOperation()
    .pipe(
      tap(() => {
        alerts.open(`${entityType} updated successfully`, {
          label: 'Success',
          appearance: 'positive',
          autoClose: 3000,
        }).subscribe();
      }),
      catchError((err) => {
        alerts.open(`Failed to update: ${err.message || 'Unknown error'}`, {
          label: 'Error',
          appearance: 'negative',
          autoClose: 0,
        }).subscribe();
        return throwError(() => err);
      })
    )
    .subscribe({
      next: onSuccess,
    });
}

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
              autoClose: 3000,
            }).subscribe();
          }),
          catchError((err) => {
            alerts.open(`Failed to delete: ${err.message || 'Unknown error'}`, {
              label: 'Error',
              appearance: 'negative',
              autoClose: 0,
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

export function withConfirmAlert<T>(
  dialogs: TuiDialogService,
  alerts: TuiAlertService,
  confirmConfig: {
    label: string;
    content: string;
  },
  operation: () => Observable<T>,
  onSuccess: () => void,
  successMessage: string,
): void {
  dialogs
    .open<boolean>(TUI_CONFIRM, {
      label: confirmConfig.label,
      size: 's',
      data: {
        content: confirmConfig.content,
        yes: 'Confirm',
        no: 'Cancel',
      },
    })
    .pipe(
      switchMap((confirmed) => {
        if (!confirmed) return EMPTY;
        return operation().pipe(
          tap(() => {
            alerts.open(successMessage, {
              label: 'Success',
              appearance: 'positive',
              autoClose: 3000,
            }).subscribe();
          }),
          catchError((err) => {
            alerts.open(`Failed to complete operation: ${err.message || 'Unknown error'}`, {
              label: 'Error',
              appearance: 'negative',
              autoClose: 0,
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
