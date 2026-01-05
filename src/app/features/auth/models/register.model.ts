export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  person_id?: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  person_id?: number | null;
  roles: string[];
}
