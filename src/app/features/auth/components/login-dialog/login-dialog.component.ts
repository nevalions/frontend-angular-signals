import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { tuiDialog } from '@taiga-ui/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { LoginRequest } from '../../models/login.model';
import { AuthService } from '../../services/auth.service';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TuiButton],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.less',
})
export class LoginDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly context = inject<TuiDialogContext<void, void>>(POLYMORPHEUS_CONTEXT);

  private readonly registerDialog = tuiDialog(RegisterDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Create Account',
  });

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      const credentials: LoginRequest = {
        username: this.loginForm.value.username || '',
        password: this.loginForm.value.password || '',
      };

      this.authService
        .login(credentials)
        .pipe(
          tap(() => {
            this.loading.set(false);
          })
        )
        .subscribe({
          next: () => {
            this.context.completeWith();
            this.alerts
              .open('Login successful', {
                label: 'Success',
                appearance: 'positive',
                autoClose: 3000,
              })
              .subscribe();
          },
          error: (error) => {
            this.loading.set(false);
            this.alerts
              .open(`Login failed: ${error.message || 'Unknown error'}`, {
                label: 'Error',
                appearance: 'negative',
                autoClose: 0,
              })
              .subscribe();
          },
        });
    }
  }

  openRegisterDialog(): void {
    this.context.completeWith();
    this.registerDialog().subscribe();
  }
}
