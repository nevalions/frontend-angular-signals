export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  person_id?: number | null;
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
