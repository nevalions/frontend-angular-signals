import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login.model';
import { LoginResponse, UserInfo } from '../models/login-response.model';
import { buildApiUrl } from '../../../core/config/api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSignal = signal<UserInfo | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
    if (this.isAuthenticated()) {
      this.fetchCurrentUser();
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
        this.fetchCurrentUser();
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
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

  private fetchCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(buildApiUrl('/api/auth/me'), {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError((error) => {
        console.error('Failed to fetch user info:', error);
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
      } catch (e) {
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }
}
