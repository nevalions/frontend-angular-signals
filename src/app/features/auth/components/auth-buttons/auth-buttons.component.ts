import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { TuiButton, TuiIcon, TuiDialogService } from '@taiga-ui/core';
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
  imports: [TuiButton, TuiAvatar, TuiIcon],
  template: `
    @if (!authService.isAuthenticated()) {
      <div class="auth-buttons">
        <button
          type="button"
          tuiButton
          appearance="flat"
          size="s"
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
        <div class="auth-buttons__dropdown-container">
          <button
            type="button"
            class="auth-buttons__user-menu"
            (click)="toggleDropdown($event)"
            [class.active]="dropdownOpen()"
            aria-haspopup="true"
            [attr.aria-expanded]="dropdownOpen()"
          >
            <tui-avatar
              [src]="userAvatar()"
              size="s"
              class="auth-buttons__avatar"
            ></tui-avatar>
            <span class="auth-buttons__username">{{ authService.currentUser()?.username }}</span>
            <tui-icon class="auth-buttons__dropdown-icon" icon="@tui.chevron-down"></tui-icon>
          </button>

          @if (dropdownOpen()) {
            <div class="auth-buttons__dropdown-menu">
              <button
                type="button"
                class="auth-buttons__dropdown-item"
                (click)="goToProfile()"
              >
                <tui-icon icon="@tui.user"></tui-icon>
                <span>Profile</span>
              </button>
              <button
                type="button"
                class="auth-buttons__dropdown-item auth-buttons__dropdown-item--logout"
                (click)="logout()"
              >
                <tui-icon icon="@tui.log-out"></tui-icon>
                <span>Logout</span>
              </button>
            </div>
          }
        </div>
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

  readonly dropdownOpen = signal(false);

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: EventTarget | null): void {
    if (!this.dropdownOpen() || !target) {
      return;
    }

    const targetElement = target as HTMLElement;
    const authButtonsElement = document.querySelector('app-auth-buttons');
    if (authButtonsElement && !authButtonsElement.contains(targetElement)) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(open => !open);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

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

  goToProfile(): void {
    this.closeDropdown();
    const user = this.authService.currentUser();
    if (user?.person_id) {
      this.navigationHelper.toPersonDetail(user.person_id);
    } else {
      this.navigationHelper.toPersonsList();
    }
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
    this.navigationHelper.toHome();
  }
}
