import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

export interface TournamentMoveDialogData {
  content: string;
  confirmLabel: string;
  confirmText: string;
}

@Component({
  selector: 'app-tournament-move-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TuiButton],
  templateUrl: './tournament-move-dialog.component.html',
  styleUrl: './tournament-move-dialog.component.less',
})
export class TournamentMoveDialogComponent {
  private readonly context = inject<TuiDialogContext<boolean, TournamentMoveDialogData>>(POLYMORPHEUS_CONTEXT);

  confirmed = signal(false);
  data = this.context.data;

  toggle(checked: boolean): void {
    this.confirmed.set(checked);
  }

  cancel(): void {
    this.context.completeWith(false);
  }

  confirm(): void {
    if (!this.confirmed()) return;
    this.context.completeWith(true);
  }
}
