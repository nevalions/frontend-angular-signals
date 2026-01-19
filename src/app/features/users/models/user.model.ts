export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  person_id?: number | null;
  created: string;
  last_online?: string | null;
  is_online: boolean;
}

export interface UserEmailUpdate {
  email: string;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export interface PasswordChangeWithConfirm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
