import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserInfo } from '../../features/auth/models/login-response.model';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
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
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => null) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => false) },
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const result = adminGuard(null as any, null as any);

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Non-admin user access', () => {
    it('should redirect regular user to home', () => {
      const authServiceMock = {
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => mockRegularUser) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => true) },
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const result = adminGuard(null as any, null as any);

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Admin user access', () => {
    it('should allow access for admin user', () => {
      const authServiceMock = {
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => mockAdminUser) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => true) },
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const result = adminGuard(null as any, null as any);

      expect(result).toBe(true);
    });
  });
});
