import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
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
  let router: { navigate: ReturnType<typeof vi.fn>; url: string; navigateByUrl: ReturnType<typeof vi.fn> };
  let authServiceMock: { currentUser: { __v_isRef: boolean; __v_isReadonly: boolean; call: ReturnType<typeof vi.fn> }; isAuthenticated: { __v_isRef: boolean; call: ReturnType<typeof vi.fn> } };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };
  let userStoreMock: { updateUserEmail: ReturnType<typeof vi.fn>; changePassword: ReturnType<typeof vi.fn>; deleteUser: ReturnType<typeof vi.fn> };

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
        { provide: Router, useValue: router },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: UserStoreService, useValue: userStoreMock },
      ],
    });

    localStorage.clear();
  });

  describe('Unauthenticated access', () => {
    beforeEach(() => {
      authServiceMock = {
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => null) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => false) },
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (_key: string) => '1' } },
              queryParamMap: of({ get: (_key: string) => null }),
            },
          },
        ],
      });

      component = TestBed.createComponent(UserProfileComponent).componentInstance;
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
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => mockRegularUser) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => true) },
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (_key: string) => '3' } },
              queryParamMap: of({ get: (_key: string) => null }),
            },
          },
        ],
      });

      component = TestBed.createComponent(UserProfileComponent).componentInstance;
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
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => mockAdminUser) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => true) },
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (_key: string) => '3' } },
              queryParamMap: of({ get: (_key: string) => null }),
            },
          },
        ],
      });

      component = TestBed.createComponent(UserProfileComponent).componentInstance;
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
        currentUser: { __v_isRef: true, __v_isReadonly: true, call: vi.fn(() => mockRegularUser) },
        isAuthenticated: { __v_isRef: true, call: vi.fn(() => true) },
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (_key: string) => '2' } },
              queryParamMap: of({ get: (_key: string) => null }),
            },
          },
        ],
      });

      component = TestBed.createComponent(UserProfileComponent).componentInstance;
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
