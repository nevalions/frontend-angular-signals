import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(() => {
    authServiceMock = {
      login: vi.fn(() => of({ token: 'test', user: { id: 1, email: 'test@test.com', name: 'Test' } })),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with email and password controls', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should have email control with required and email validators', () => {
    const emailControl = component.loginForm.get('email');
    expect(emailControl?.validator).toBeTruthy();
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
  });

  it('should have password control with required and minLength validators', () => {
    const passwordControl = component.loginForm.get('password');
    expect(passwordControl?.validator).toBeTruthy();
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);
  });

  it('should initialize loading signal as false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should provide emailControl accessor', () => {
    expect(component.emailControl).toBe(component.loginForm.get('email'));
  });

  it('should provide passwordControl accessor', () => {
    expect(component.passwordControl).toBe(component.loginForm.get('password'));
  });

  it('should not call authService if form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call authService.login with form values', () => {
    const credentials = { email: 'test@test.com', password: 'password123' };
    component.loginForm.setValue(credentials);
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(credentials);
  });

  it('should set loading to true when submitting', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();

    expect(component.loading()).toBe(true);
  });
});
