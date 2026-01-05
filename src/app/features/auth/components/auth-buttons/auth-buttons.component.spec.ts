import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthButtonsComponent } from './auth-buttons.component';
import { AuthService } from '../../services/auth.service';

describe('AuthButtonsComponent', () => {
  let component: AuthButtonsComponent;
  let fixture: ComponentFixture<AuthButtonsComponent>;
  let authServiceMock: Partial<AuthService>;
  let routerMock: Partial<Router>;

  beforeEach(() => {
    authServiceMock = {
      logout: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    } as unknown as Partial<Router>;

    TestBed.configureTestingModule({
      imports: [AuthButtonsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    fixture = TestBed.createComponent(AuthButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logout method', () => {
    expect(typeof component.logout).toBe('function');
  });

  it('should navigate to home on logout', () => {
    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
