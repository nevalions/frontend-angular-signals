import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserInfo } from '../../features/auth/models/login-response.model';
import { authGuard } from './auth.guard';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  const mockAdminUser: UserInfo = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    is_active: true,
    person_id: null,
    roles: ['admin'],
  };

  const mockRegularUser: UserInfo = {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    is_active: true,
    person_id: null,
    roles: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Unauthenticated access', () => {
    it('should redirect unauthenticated user to home', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => null),
        isAuthenticated: vi.fn(() => false),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const result = TestBed.runInInjectionContext(() => authGuard(undefined as unknown as ActivatedRouteSnapshot, undefined as unknown as RouterStateSnapshot));

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Authenticated access', () => {
    it('should allow access for authenticated admin user', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const result = TestBed.runInInjectionContext(() => authGuard(undefined as unknown as ActivatedRouteSnapshot, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });

    it('should allow access for authenticated regular user', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const result = TestBed.runInInjectionContext(() => authGuard(undefined as unknown as ActivatedRouteSnapshot, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });
  });
});
