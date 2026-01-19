import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../auth/services/auth.service';
import { User, UserEmailUpdate, PasswordChange } from '../models/user.model';
import { buildApiUrl } from '../../../core/config/api.constants';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  getUserById(userId: number): Observable<User> {
    const current = this.authService.currentUser();
    if (current?.id === userId) {
      return this.http.get<User>(buildApiUrl('/api/users/me'));
    }
    return this.apiService.get<User>(`/api/users/${userId}`);
  }

  updateUserEmail(userId: number, data: UserEmailUpdate): Observable<User> {
    const current = this.authService.currentUser();
    if (current?.id === userId) {
      return this.http.put<User>(buildApiUrl('/api/users/me'), data);
    }
    return this.http.put<User>(buildApiUrl(`/api/users/${userId}`), data);
  }

  changePassword(userId: number, data: PasswordChange): Observable<User> {
    const current = this.authService.currentUser();
    if (current?.id === userId) {
      return this.http.post<User>(buildApiUrl('/api/users/me/change-password'), data);
    }
    return this.http.post<User>(buildApiUrl(`/api/users/${userId}/change-password`), data);
  }

  deleteUser(userId: number): Observable<void> {
    return this.apiService.delete('/api/users', userId);
  }
}
