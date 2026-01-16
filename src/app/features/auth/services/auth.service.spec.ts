import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { UserInfo } from '../models/login-response.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { buildApiUrl } from '../../../core/config/api.constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUserInfo: UserInfo = {
    id:1,
    username: 'testuser',
    email: 'test@example.com',
    is_active: true,
    person_id: null,
    roles: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with isAuthenticated false', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should initialize with currentUser null', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('auth_token', 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should return null when token not in localStorage', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should clear currentUser signal on logout', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUserInfo));
    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should load user from localStorage on initialization', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockUserInfo));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    const newService = TestBed.inject(AuthService);
    expect(newService.currentUser()).toEqual(mockUserInfo);
    expect(newService.isAuthenticated()).toBe(true);
  });

  it('should login and store token', () => {
    service.login({ username: 'testuser', password: 'password' }).subscribe();

    const req = httpMock.expectOne(buildApiUrl('/api/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush({ access_token: 'test-token-123', token_type: 'bearer' });

    expect(localStorage.getItem('auth_token')).toBe('test-token-123');
  });

  it('should return auth headers with token', () => {
    localStorage.setItem('auth_token', 'test-token');
    const headers = service.getAuthHeaders();
    expect(headers).toEqual({ Authorization: 'Bearer test-token' });
  });

  it('should return empty auth headers without token', () => {
    const headers = service.getAuthHeaders();
    expect(headers).toEqual({});
  });
});
