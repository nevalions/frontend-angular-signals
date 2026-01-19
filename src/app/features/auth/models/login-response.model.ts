export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  person_id: number | null;
  roles: string[];
  created?: string;
  last_online?: string | null;
  is_online?: boolean;
}
