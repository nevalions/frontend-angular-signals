import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { UserList, UserListResponse, GlobalSettings, SettingUpdate } from '../models/settings.model';
import { buildApiUrl } from '../../../core/config/api.constants';

@Injectable({
  providedIn: 'root',
})
export class SettingsStoreService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);

  users = signal<UserList[]>([]);
  usersLoading = signal(false);
  usersError = signal<string | null>(null);
  usersMetadata = signal<UserListResponse['metadata'] | null>(null);

  admins = signal<UserList[]>([]);
  adminsLoading = signal(false);
  adminsError = signal<string | null>(null);
  adminsMetadata = signal<UserListResponse['metadata'] | null>(null);

  globalSettings = signal<GlobalSettings | null>(null);
  globalSettingsLoading = signal(false);
  globalSettingsError = signal<string | null>(null);

  getUsersPaginated(page: number, itemsPerPage: number, search?: string, order_by?: string, ascending?: boolean): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(buildApiUrl('/api/users/search'), {
      params: {
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
        ...(search && { search }),
        ...(order_by && { order_by }),
        ...(ascending !== undefined && { ascending: ascending.toString() }),
      },
    });
  }

  getAdminsPaginated(page: number, itemsPerPage: number, search?: string): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(buildApiUrl('/api/users/search'), {
      params: {
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
        ...(search && { search }),
        role_names: ['admin'],
      },
    });
  }

  getGlobalSettings(): Observable<GlobalSettings> {
    return this.http.get<GlobalSettings>(buildApiUrl('/api/settings/global'));
  }

  updateGlobalSetting(settingKey: string, value: SettingUpdate[string]): Observable<GlobalSettings> {
    return this.http.patch<GlobalSettings>(buildApiUrl(`/api/settings/global/${settingKey}`), { value });
  }

  makeUserAdmin(userId: number): Observable<void> {
    return this.http.post<void>(buildApiUrl(`/api/users/${userId}/admin`), {});
  }

  removeUserAdmin(userId: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/users/${userId}/admin`));
  }
}
