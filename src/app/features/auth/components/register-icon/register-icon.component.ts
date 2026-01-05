import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, TuiDialogService } from '@taiga-ui/core';
import { tuiDialog } from '@taiga-ui/core';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';

@Component({
  selector: 'app-register-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon],
  template: `
    <button
      type="button"
      tuiButton
      appearance="flat"
      class="register-icon"
      (click)="openRegisterDialog()"
    >
      <tui-icon class="register-icon__icon" icon="@tui.user-plus"></tui-icon>
      <span class="register-icon__text">Sign Up</span>
    </button>
  `,
  styleUrl: './register-icon.component.less',
})
export class RegisterIconComponent {
  private dialogs = inject(TuiDialogService);

  private registerDialog = tuiDialog(RegisterDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Create Account',
  });

  openRegisterDialog(): void {
    this.registerDialog().subscribe();
  }
}
