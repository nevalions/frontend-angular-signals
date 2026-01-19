export interface UserList {
  id: number;
  username: string;
  email: string;
  roles: string[];
  is_active: boolean;
  person_id: number | null;
  created: string;
  last_online: string | null;
  is_online: boolean;
}

export interface RoleList {
  id: number;
  name: string;
  description: string | null;
  user_count: number;
}

export interface RoleListResponse {
  data: RoleList[];
  metadata: {
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
}

export interface UserListResponse {
  data: UserList[];
  metadata: {
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
}

export interface GlobalSetting {
  id: number;
  key: string;
  value: string;
  value_type: 'string' | 'int' | 'bool' | 'json';
  category: string | null;
  description: string | null;
  updated_at: string;
}

export interface GlobalSettingValue {
  value: string;
}

export interface GlobalSettingsGrouped {
  [category: string]: GlobalSetting[];
}

export interface GlobalSettingCreate {
  key: string;
  value: string;
  value_type: 'string' | 'int' | 'bool' | 'json';
  category?: string;
  description?: string;
}

export interface GlobalSettingUpdate {
  key?: string;
  value?: string;
  value_type?: 'string' | 'int' | 'bool' | 'json';
  category?: string;
  description?: string;
}
