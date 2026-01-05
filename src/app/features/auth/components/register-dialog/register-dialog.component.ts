import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { RegisterRequest } from '../../models/register.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TuiButton],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.less',
})
export class RegisterDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alerts = inject(TuiAlertService);

  registerForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  loading = signal(false);

  get usernameControl() {
    return this.registerForm.get('username');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirm_password');
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      const userData: RegisterRequest = {
        username: this.registerForm.value.username || '',
        email: this.registerForm.value.email || '',
        password: this.registerForm.value.password || '',
      };

      this.authService
        .register(userData)
        .pipe(
          tap(() => {
            this.loading.set(false);
          })
        )
        .subscribe({
          next: () => {
            this.alerts
              .open('Account created successfully! Please sign in.', {
                label: 'Success',
                appearance: 'positive',
                autoClose: 3000,
              })
              .subscribe();
          },
          error: (error) => {
            this.loading.set(false);
            this.alerts
              .open(`Registration failed: ${error.error?.detail || error.message || 'Unknown error'}`, {
                label: 'Error',
                appearance: 'negative',
                autoClose: 0,
              })
              .subscribe();
          },
        });
    }
  }
}
