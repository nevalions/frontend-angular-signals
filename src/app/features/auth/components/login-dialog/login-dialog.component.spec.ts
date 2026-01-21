import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/login-response.model';

interface LoginCredentials {
  username: string;
  password: string;
}

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  let authServiceMock: {
    login: (credentials: LoginCredentials) => Observable<LoginResponse>;
  };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };
  let contextMock: { completeWith: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      login: vi.fn(() =>
        new Observable<LoginResponse>(subscriber => {
          subscriber.next({ access_token: 'test-token-123', token_type: 'bearer' });
          subscriber.complete();
        })
      ) as typeof authServiceMock.login,
    };

    alertsMock = {
      open: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next({});
        subscriber.complete();
      })),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next({});
        subscriber.complete();
      })),
    };

    contextMock = {
      completeWith: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TuiButton, LoginDialogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: POLYMORPHEUS_CONTEXT, useValue: contextMock },
      ],
    });

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with username and password controls', () => {
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should have username control with required validator', () => {
    const usernameControl = component.loginForm.get('username');
    expect(usernameControl?.validator).toBeTruthy();
    usernameControl?.setValue('');
    expect(usernameControl?.hasError('required')).toBe(true);
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

  it('should provide usernameControl accessor', () => {
    expect(component.usernameControl).toBe(component.loginForm.get('username'));
  });

  it('should provide passwordControl accessor', () => {
    expect(component.passwordControl).toBe(component.loginForm.get('password'));
  });

  it('should not call authService if form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call authService.login with form values', () => {
    const credentials = { username: 'testuser', password: 'password123' };
    component.loginForm.setValue(credentials);
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(credentials);
  });

  it('should reset loading after successful login', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password123' });
    component.onSubmit();

    expect(component.loading()).toBe(false);
  });
});
