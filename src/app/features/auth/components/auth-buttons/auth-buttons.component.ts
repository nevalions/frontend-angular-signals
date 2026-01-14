import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, TuiDialogService } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { tuiDialog } from '@taiga-ui/core';
import { AuthService } from '../../services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-auth-buttons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiAvatar, TuiIcon],
  template: `
    @if (!authService.isAuthenticated()) {
      <div class="auth-buttons">
        <button
          type="button"
          tuiButton
          appearance="primary"
          size="m"
          class="auth-buttons__register"
          (click)="openRegisterDialog()"
          aria-label="Sign Up"
          title="Sign Up"
        >
          <tui-icon class="auth-buttons__icon" icon="@tui.user-plus"></tui-icon>
          <span class="auth-buttons__text">Sign Up</span>
        </button>

        <button
          type="button"
          tuiButton
          appearance="flat"
          size="s"
          class="auth-buttons__login"
          (click)="openLoginDialog()"
          aria-label="Sign In"
          title="Sign In"
        >
          <tui-icon class="auth-buttons__icon" icon="@tui.user"></tui-icon>
          <span class="auth-buttons__text">Sign In</span>
        </button>
      </div>
    } @else {
      <div class="auth-buttons auth-buttons--logged-in">
        <div class="auth-buttons__user">
          <tui-avatar
            [src]="userAvatar()"
            size="s"
            class="auth-buttons__avatar"
          ></tui-avatar>
          <span class="auth-buttons__username">{{ authService.currentUser()?.username }}</span>
        </div>

        <button
          type="button"
          tuiButton
          appearance="flat"
          size="s"
          class="auth-buttons__logout"
          (click)="logout()"
          aria-label="Sign Out"
          title="Sign Out"
        >
          <tui-icon class="auth-buttons__icon" icon="@tui.log-out"></tui-icon>
          <span class="auth-buttons__text auth-buttons__text--hide-mobile">Sign Out</span>
        </button>
      </div>
    }
  `,
  styleUrl: './auth-buttons.component.less',
})
export class AuthButtonsComponent {
  protected readonly authService = inject(AuthService);
  private readonly navigationHelper = inject(NavigationHelperService);
  private readonly dialogs = inject(TuiDialogService);

  private readonly loginDialog = tuiDialog(LoginDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Sign In',
  });

  private readonly registerDialog = tuiDialog(RegisterDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Create Account',
  });

  protected userAvatar(): string {
    const user = this.authService.currentUser();
    return user?.person_id ? `/api/persons/${user.person_id}/photo` : '';
  }

  openLoginDialog(): void {
    this.loginDialog().subscribe();
  }

  openRegisterDialog(): void {
    this.registerDialog().subscribe();
  }

  logout(): void {
    this.authService.logout();
    this.navigationHelper.toHome();
  }
}
