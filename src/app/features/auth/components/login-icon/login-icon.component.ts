import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, TuiDialogService } from '@taiga-ui/core';
import { tuiDialog } from '@taiga-ui/core';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-login-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon],
  template: `
    <button
      type="button"
      tuiButton
      appearance="flat"
      class="login-icon"
      (click)="openLoginDialog()"
    >
      <tui-icon class="login-icon__icon" icon="@tui.user"></tui-icon>
      <span class="login-icon__text">Sign In</span>
    </button>
  `,
  styleUrl: './login-icon.component.less',
})
export class LoginIconComponent {
  private dialogs = inject(TuiDialogService);

  private loginDialog = tuiDialog(LoginDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Sign In',
  });

  openLoginDialog(): void {
    this.loginDialog().subscribe();
  }
}
