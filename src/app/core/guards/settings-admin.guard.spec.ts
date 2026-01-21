import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserInfo } from '../../features/auth/models/login-response.model';
import { settingsAdminGuard } from './settings-admin.guard';
import type { RouterStateSnapshot } from '@angular/router';

describe('settingsAdminGuard', () => {
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
    it('should redirect unauthenticated user to home (any tab)', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => null),
        isAuthenticated: vi.fn(() => false),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const mockRoute = {
        queryParamMap: new Map([['tab', 'dashboard']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Non-admin user accessing sensitive tabs', () => {
    it('should redirect non-admin from users tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const mockRoute = {
        queryParamMap: new Map([['tab', 'users']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });

    it('should redirect non-admin from roles tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const mockRoute = {
        queryParamMap: new Map([['tab', 'roles']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });

    it('should redirect non-admin from global-settings tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'createUrlTree');

      const mockRoute = {
        queryParamMap: new Map([['tab', 'global-settings']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Non-admin user accessing non-sensitive tabs', () => {
    it('should allow non-admin user to access dashboard tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'dashboard']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });

    it('should allow non-admin user when no tab specified (defaults to dashboard)', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'dashboard']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });
  });

  describe('Admin user accessing any tab', () => {
    it('should allow admin to access users tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'users']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });

    it('should allow admin to access roles tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'roles']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });

    it('should allow admin to access global-settings tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'global-settings']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });

    it('should allow admin to access dashboard tab', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const mockRoute = {
        queryParamMap: new Map([['tab', 'dashboard']]),
      } as unknown as ActivatedRouteSnapshot;

      const result = TestBed.runInInjectionContext(() => settingsAdminGuard(mockRoute, undefined as unknown as RouterStateSnapshot));

      expect(result).toBe(true);
    });
  });
});
