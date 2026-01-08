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
export type SortOrder = 'asc' | 'desc';
export type SortBy = PersonSortBy;

export interface PaginationMetadata {
  page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PersonsPaginatedResponse {
  data: Person[];
  metadata: PaginationMetadata;
}
