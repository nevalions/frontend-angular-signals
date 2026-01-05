import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LoginResponse } from '../models/login-response.model';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  const mockLoginResponse: LoginResponse = {
    token: 'test-token-123',
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
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
    localStorage.setItem('auth_user', JSON.stringify(mockLoginResponse.user));
    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should load user from localStorage on initialization', () => {
    localStorage.setItem('auth_user', JSON.stringify(mockLoginResponse.user));
    const newService = TestBed.inject(AuthService);
    expect(newService.currentUser()).toEqual(mockLoginResponse.user);
    expect(newService.isAuthenticated()).toBe(true);
  });
});
