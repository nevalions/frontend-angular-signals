import { PaginatedResponse, SortOrder } from '../../../core/models';

export interface Person {
  id: number;
  person_eesl_id?: number | null;
  first_name: string;
  second_name: string;
  person_photo_url: string | null;
  person_photo_icon_url: string | null;
  person_photo_web_url: string | null;
  person_dob?: string | null;
}

export interface PhotoUploadResponse {
  original: string;
  icon: string;
  webview: string;
}

export interface PersonCreate {
  person_eesl_id?: number | null;
  first_name: string;
  second_name: string;
  person_photo_url?: string | null;
  person_photo_icon_url?: string | null;
  person_photo_web_url?: string | null;
  person_dob?: string | null;
}

export interface PersonUpdate {
  person_eesl_id?: number | null;
  first_name?: string;
  second_name?: string;
  person_photo_url?: string | null;
  person_photo_icon_url?: string | null;
  person_photo_web_url?: string | null;
  person_dob?: string | null;
}

export type PersonSortBy = 'first_name' | 'second_name' | 'id';
export type PersonsPaginatedResponse = PaginatedResponse<Person>;
