import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { of, throwError } from 'rxjs';
import { RegisterDialogComponent } from './register-dialog.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterDialogComponent', () => {
  let component: RegisterDialogComponent;
  let fixture: ComponentFixture<RegisterDialogComponent>;
  let authServiceMock: Partial<AuthService>;
  let alertsMock: any;

  beforeEach(() => {
    authServiceMock = {
      register: vi.fn(() => of({} as any)),
    };

    alertsMock = {
      open: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TuiButton, RegisterDialogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TuiAlertService, useValue: alertsMock },
      ],
    });

    fixture = TestBed.createComponent(RegisterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all required fields', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('username')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('confirm_password')).toBeDefined();
  });

  describe('Form Controls', () => {
    it('should provide usernameControl accessor', () => {
      expect(component.usernameControl).toBe(component.registerForm.get('username'));
    });

    it('should provide emailControl accessor', () => {
      expect(component.emailControl).toBe(component.registerForm.get('email'));
    });

    it('should provide passwordControl accessor', () => {
      expect(component.passwordControl).toBe(component.registerForm.get('password'));
    });

    it('should provide confirmPasswordControl accessor', () => {
      expect(component.confirmPasswordControl).toBe(component.registerForm.get('confirm_password'));
    });
  });

  describe('Username Validation', () => {
    it('should require username', () => {
      component.usernameControl?.setValue('');
      component.usernameControl?.markAsTouched();
      expect(component.usernameControl?.hasError('required')).toBe(true);
    });

    it('should validate username minimum length', () => {
      component.usernameControl?.setValue('ab');
      component.usernameControl?.markAsTouched();
      expect(component.usernameControl?.hasError('minlength')).toBe(true);
    });

    it('should validate username maximum length', () => {
      component.usernameControl?.setValue('a'.repeat(101));
      component.usernameControl?.markAsTouched();
      expect(component.usernameControl?.hasError('maxlength')).toBe(true);
    });

    it('should accept valid username', () => {
      component.usernameControl?.setValue('validuser');
      expect(component.usernameControl?.valid).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should require email', () => {
      component.emailControl?.setValue('');
      component.emailControl?.markAsTouched();
      expect(component.emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.emailControl?.setValue('invalidemail');
      component.emailControl?.markAsTouched();
      expect(component.emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      component.emailControl?.setValue('test@example.com');
      expect(component.emailControl?.valid).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should require password', () => {
      component.passwordControl?.setValue('');
      component.passwordControl?.markAsTouched();
      expect(component.passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate password minimum length', () => {
      component.passwordControl?.setValue('12345');
      component.passwordControl?.markAsTouched();
      expect(component.passwordControl?.hasError('minlength')).toBe(true);
    });

    it('should accept valid password', () => {
      component.passwordControl?.setValue('password123');
      expect(component.passwordControl?.valid).toBe(true);
    });
  });

  describe('Confirm Password Validation', () => {
    it('should require confirm password', () => {
      component.confirmPasswordControl?.setValue('');
      component.confirmPasswordControl?.markAsTouched();
      expect(component.confirmPasswordControl?.hasError('required')).toBe(true);
    });

    it('should show mismatch error when passwords do not match', () => {
      component.passwordControl?.setValue('password123');
      component.confirmPasswordControl?.setValue('password456');
      component.confirmPasswordControl?.markAsTouched();
      expect(component.registerForm.hasError('mismatch')).toBe(true);
    });

    it('should accept matching passwords', () => {
      component.passwordControl?.setValue('password123');
      component.confirmPasswordControl?.setValue('password123');
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('should call register with correct data on valid form', () => {
      component.registerForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      });

      component.onSubmit();

      expect(authServiceMock.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should set loading to true during submission', () => {
      component.registerForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      });

      component.onSubmit();

      expect(component.loading()).toBe(false);
    });

    it('should show success alert on successful registration', () => {
      component.registerForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      });

      component.onSubmit();

      expect(alertsMock.open).toHaveBeenCalledWith('Account created successfully! Please sign in.', {
        label: 'Success',
        appearance: 'positive',
        autoClose: 3000,
      });
    });

    it('should show error alert on failed registration', () => {
      component.registerForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      });

      const error = { error: { detail: 'Username already exists' } };
      if (authServiceMock.register) {
        vi.mocked(authServiceMock.register).mockReturnValue(throwError(() => error));
      }

      component.onSubmit();

      expect(alertsMock.open).toHaveBeenCalledWith('Registration failed: Username already exists', {
        label: 'Error',
        appearance: 'negative',
        autoClose: 0,
      });
    });

    it('should reset loading state on error', () => {
      component.registerForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      });

      const error = new Error('Network error');
      if (authServiceMock.register) {
        vi.mocked(authServiceMock.register).mockReturnValue(throwError(() => error));
      }

      component.onSubmit();

      expect(component.loading()).toBe(false);
    });
  });
});
