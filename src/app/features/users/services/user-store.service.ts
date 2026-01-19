import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, UserEmailUpdate, PasswordChange } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private apiService = inject(ApiService);

  getUserById(userId: number): Observable<User> {
    return this.apiService.get<User>(`/api/users/id/${userId}/`);
  }

  updateUserEmail(userId: number, data: UserEmailUpdate): Observable<User> {
    return this.apiService.put<User>('/api/users/', userId, data, true);
  }

  changePassword(userId: number, data: PasswordChange): Observable<void> {
    return this.apiService.post<void>(`/api/users/id/${userId}/change-password`, data);
  }

  deleteUser(userId: number): Observable<void> {
    return this.apiService.delete('/api/users', userId);
  }
}
