import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import {
  UserList,
  UserListResponse,
  RoleList,
  RoleListResponse,
  GlobalSetting,
  GlobalSettingValue,
  GlobalSettingsGrouped,
  GlobalSettingCreate,
  GlobalSettingUpdate,
} from '../models/settings.model';
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

  globalSettings = signal<GlobalSettingsGrouped | null>(null);
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

  getGlobalSettingsGrouped(): Observable<GlobalSettingsGrouped> {
    return this.http.get<GlobalSettingsGrouped>(buildApiUrl('/api/settings/grouped'));
  }

  getGlobalSettingValue(key: string): Observable<GlobalSettingValue> {
    return this.http.get<GlobalSettingValue>(buildApiUrl(`/api/settings/value/${key}`));
  }

  getGlobalSettingsByCategory(category: string): Observable<GlobalSetting[]> {
    return this.http.get<GlobalSetting[]>(buildApiUrl(`/api/settings/category/${category}`));
  }

  createGlobalSetting(setting: GlobalSettingCreate): Observable<GlobalSetting> {
    return this.http.post<GlobalSetting>(buildApiUrl('/api/settings/'), setting);
  }

  updateGlobalSetting(id: number, setting: GlobalSettingUpdate): Observable<GlobalSetting> {
    return this.http.put<GlobalSetting>(buildApiUrl(`/api/settings/${id}/`), setting);
  }

  deleteGlobalSetting(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/settings/id/${id}`));
  }

  makeUserAdmin(userId: number): Observable<void> {
    return this.http.post<void>(buildApiUrl(`/api/users/${userId}/admin`), {});
  }

  removeUserAdmin(userId: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/users/${userId}/admin`));
  }

  getRolesPaginated(page: number, itemsPerPage: number, search?: string, order_by?: string): Observable<RoleListResponse> {
    return this.http.get<RoleListResponse>(buildApiUrl('/api/roles/paginated'), {
      params: {
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
        ...(search && { search }),
        ...(order_by && { order_by }),
      },
    });
  }

  createRole(name: string, description?: string): Observable<RoleList> {
    return this.http.post<RoleList>(buildApiUrl('/api/roles'), { name, description });
  }

  updateRole(roleId: number, name?: string, description?: string): Observable<RoleList> {
    return this.http.patch<RoleList>(buildApiUrl(`/api/roles/${roleId}`), { name, description });
  }

  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/roles/${roleId}`));
  }

  getUsersWithFilters(page: number, itemsPerPage: number, search?: string, role_names?: string[], is_online?: boolean): Observable<UserListResponse> {
    const params: Record<string, string | string[]> = {
      page: page.toString(),
      items_per_page: itemsPerPage.toString(),
      ...(search && { search }),
      ...(is_online !== undefined && { ['is_online']: is_online.toString() }),
      ...(role_names && { role_names }),
    };

    return this.http.get<UserListResponse>(buildApiUrl('/api/users/search'), { params });
  }

  addUserRole(userId: number, roleId: number): Observable<void> {
    return this.http.post<void>(buildApiUrl(`/api/users/${userId}/roles`), { role_id: roleId });
  }
}
