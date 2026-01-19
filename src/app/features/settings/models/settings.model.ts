export interface UserList {
  id: number;
  username: string;
  email: string;
  roles: string[];
  is_active: boolean;
  person_id?: number | null;
  created: string;
  last_online?: string | null;
  is_online: boolean;
}

export interface RoleList {
  id: number;
  name: string;
  description?: string | null;
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

export interface GlobalSettings {
  site_name: string;
  default_season_id: number;
  timezone: string;
  allow_public_registration: boolean;
  require_email_verification: boolean;
  default_user_role: string;
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_email: string;
  sender_name: string;
  max_file_upload_size_mb: number;
  allowed_image_formats: string[];
  static_files_path: string;
  rate_limit_per_minute: number;
  api_version: string;
  enable_api_documentation: boolean;
}

export interface SettingUpdate {
  [key: string]: string | number | boolean | string[];
}
