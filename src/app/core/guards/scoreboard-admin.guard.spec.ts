import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ScoreboardStoreService } from '../../features/scoreboard/services/scoreboard-store.service';
import { UserInfo } from '../../features/auth/models/login-response.model';
import { scoreboardAdminGuard } from './scoreboard-admin.guard';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('scoreboardAdminGuard', () => {
  const mockAdminUser: UserInfo = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    is_active: true,
    person_id: null,
    roles: ['admin'],
  };

  const mockEditorUser: UserInfo = {
    id: 2,
    username: 'editor',
    email: 'editor@example.com',
    is_active: true,
    person_id: null,
    roles: ['editor'],
  };

  const mockOwnerUser: UserInfo = {
    id: 3,
    username: 'owner',
    email: 'owner@example.com',
    is_active: true,
    person_id: null,
    roles: [],
  };

  const mockRegularUser: UserInfo = {
    id: 4,
    username: 'user',
    email: 'user@example.com',
    is_active: true,
    person_id: null,
    roles: [],
  };

  const createMockRoute = (matchId: string | null): ActivatedRouteSnapshot =>
    ({
      paramMap: {
        get: vi.fn().mockReturnValue(matchId),
      },
    }) as unknown as ActivatedRouteSnapshot;

  const mockMatchData = {
    match: {
      id: 123,
      user_id: 3,
      team_a_id: 1,
      team_b_id: 2,
      isprivate: false,
    },
    match_data: {} as never,
    teams: { team_a: {} as never, team_b: {} as never },
    players: [],
    events: [],
    scoreboard: null,
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

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Admin user access', () => {
    it('should allow access for admin user without fetching match data', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      const scoreboardStoreMock = {
        getComprehensiveMatchData: vi.fn(),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ScoreboardStoreService, { useValue: scoreboardStoreMock });

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(scoreboardStoreMock.getComprehensiveMatchData).not.toHaveBeenCalled();
    });
  });

  describe('Editor user access', () => {
    it('should allow access for editor user without fetching match data', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockEditorUser),
        isAuthenticated: vi.fn(() => true),
      };

      const scoreboardStoreMock = {
        getComprehensiveMatchData: vi.fn(),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ScoreboardStoreService, { useValue: scoreboardStoreMock });

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(scoreboardStoreMock.getComprehensiveMatchData).not.toHaveBeenCalled();
    });
  });

  describe('Owner user access', () => {
    it('should allow access for owner user when user_id matches', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockOwnerUser),
        isAuthenticated: vi.fn(() => true),
      };

      const scoreboardStoreMock = {
        getComprehensiveMatchData: vi.fn(() => of(mockMatchData)),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ScoreboardStoreService, { useValue: scoreboardStoreMock });

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(scoreboardStoreMock.getComprehensiveMatchData).toHaveBeenCalledWith(123);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('Non-owner regular user access', () => {
    it('should redirect regular user to home when user_id does not match', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      const scoreboardStoreMock = {
        getComprehensiveMatchData: vi.fn(() => of(mockMatchData)),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ScoreboardStoreService, { useValue: scoreboardStoreMock });

      const router = TestBed.inject(Router);

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(scoreboardStoreMock.getComprehensiveMatchData).toHaveBeenCalledWith(123);
      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('Missing matchId', () => {
    it('should redirect to home when matchId is missing', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

      const router = TestBed.inject(Router);

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute(null), undefined as unknown as RouterStateSnapshot)
      );

      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });

  describe('API error', () => {
    it('should redirect to home when API call fails', () => {
      const authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      const scoreboardStoreMock = {
        getComprehensiveMatchData: vi.fn(() => throwError(() => new Error('API error'))),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ScoreboardStoreService, { useValue: scoreboardStoreMock });

      const router = TestBed.inject(Router);

      const result = TestBed.runInInjectionContext(() =>
        scoreboardAdminGuard(createMockRoute('123'), undefined as unknown as RouterStateSnapshot)
      );

      expect(result).toEqual(router.createUrlTree(['/home']));
    });
  });
});
