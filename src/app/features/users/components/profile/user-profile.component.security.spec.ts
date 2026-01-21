import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../../../auth/services/auth.service';
import { UserStoreService } from '../../services/user-store.service';
import { UserInfo } from '../../../auth/models/login-response.model';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';

describe('UserProfileComponent - Security Tests', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let router: { navigate: ReturnType<typeof vi.fn>; url: string; navigateByUrl: ReturnType<typeof vi.fn> };
  let authServiceMock: { currentUser: ReturnType<typeof vi.fn>; isAuthenticated: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };
  let userStoreMock: { updateUserEmail: ReturnType<typeof vi.fn>; changePassword: ReturnType<typeof vi.fn>; deleteUser: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

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
    router = {
      navigate: vi.fn(),
      url: '/users/1',
      navigateByUrl: vi.fn(),
    };

    alertsMock = {
      open: vi.fn(() => of({})),
    };

    dialogsMock = {
      open: vi.fn(() => of(true)),
    };

    userStoreMock = {
      updateUserEmail: vi.fn(() => of({})),
      changePassword: vi.fn(() => of({})),
      deleteUser: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: UserStoreService, useValue: userStoreMock },
      ],
    });

    localStorage.clear();
  });

  afterEach(() => {
    const pending = httpMock.match(() => true);
    pending.forEach((req) => req.flush({}));
    httpMock.verify();
  });

  describe('Unauthenticated access', () => {
    beforeEach(() => {
      authServiceMock = {
        currentUser: vi.fn(() => null),
        isAuthenticated: vi.fn(() => false),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (_key: string) => '1' } },
          queryParamMap: of({ get: (_key: string) => null }),
        },
      });

      httpMock = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should redirect unauthenticated user to home', () => {
      expect(component.canView()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not allow viewing any profile when not authenticated', () => {
      expect(component.canView()).toBe(false);
      expect(component.isOwner()).toBe(false);
      expect(component.isAdmin()).toBe(false);
    });
  });

  describe('Non-admin user access to other profiles', () => {
    beforeEach(() => {
      authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (_key: string) => '3' } },
          queryParamMap: of({ get: (_key: string) => null }),
        },
      });

      httpMock = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should redirect non-admin user viewing other user profile', () => {
      expect(component.canView()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not allow editing other user profile', () => {
      expect(component.canEdit()).toBe(false);
    });

    it('should not allow deleting other user profile', () => {
      expect(component.canDelete()).toBe(false);
    });

    it('should not show delete menu item for other users', () => {
      const menuItems = component.customMenuItems();
      expect(menuItems.length).toBe(0);
    });
  });

  describe('Admin user access to any profile', () => {
    beforeEach(() => {
      authServiceMock = {
        currentUser: vi.fn(() => mockAdminUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (_key: string) => '3' } },
          queryParamMap: of({ get: (_key: string) => null }),
        },
      });

      httpMock = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should allow admin to view any user profile', () => {
      expect(component.canView()).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should allow admin to edit any user profile', () => {
      expect(component.canEdit()).toBe(true);
    });

    it('should allow admin to delete any user profile', () => {
      expect(component.canDelete()).toBe(true);
    });

    it('should show delete menu item for admin', () => {
      const menuItems = component.customMenuItems();
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].id).toBe('delete-user');
    });
  });

  describe('Regular user viewing own profile', () => {
    beforeEach(() => {
      authServiceMock = {
        currentUser: vi.fn(() => mockRegularUser),
        isAuthenticated: vi.fn(() => true),
      };

      TestBed.overrideProvider(AuthService, { useValue: authServiceMock });
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          snapshot: { paramMap: { get: (_key: string) => '2' } },
          queryParamMap: of({ get: (_key: string) => null }),
        },
      });

      httpMock = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(UserProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should allow user to view own profile', () => {
      expect(component.canView()).toBe(true);
      expect(component.isOwner()).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should allow user to edit own profile', () => {
      expect(component.canEdit()).toBe(true);
    });

    it('should allow user to delete own profile', () => {
      expect(component.canDelete()).toBe(true);
    });

    it('should show delete menu item for own profile', () => {
      const menuItems = component.customMenuItems();
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].id).toBe('delete-user');
    });
  });
});
