import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login.model';
import { LoginResponse, UserInfo } from '../models/login-response.model';
import { RegisterRequest, UserResponse } from '../models/register.model';
import { buildApiUrl } from '../../../core/config/api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSignal = signal<UserInfo | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly currentUser = this.currentUserSignal.asReadonly();

  private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

  private initializationDone = false;

  constructor() {
    this.loadFromStorage();
  }

  initialize(): void {
    if (this.initializationDone) return;

    this.initializationDone = true;

    if (this.isAuthenticated()) {
      this.fetchCurrentUser().subscribe(() => {
        this.startHeartbeat();
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<LoginResponse>(buildApiUrl('/api/auth/login'), body.toString(), { headers }).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        this.fetchCurrentUser().subscribe(() => {
          this.startHeartbeat();
        });
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(buildApiUrl('/api/users/register'), userData).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.stopHeartbeat();
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  heartbeat(): Observable<void> {
    return this.http.post<void>(buildApiUrl('/api/auth/heartbeat'), null).pipe(
      tap(() => {
      }),
      catchError((error) => {
        console.error('[AuthService] Heartbeat failed:', error);
        return of(undefined);
      })
    );
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatIntervalId = setInterval(() => {
      this.heartbeat().subscribe();
    }, 60000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private fetchCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(buildApiUrl('/api/auth/me'), {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap((user) => {
        // console.log('[AuthService] Fetched user info:', user);
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError((error) => {
        console.error('[AuthService] Failed to fetch user info:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private loadFromStorage(): void {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        this.currentUserSignal.set(user);
      } catch {
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }
}
