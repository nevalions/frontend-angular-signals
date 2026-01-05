export interface Person {
  id: number;
  first_name: string;
  second_name: string;
  person_photo_url: string | null;
}

export interface PersonCreate {
  first_name: string;
  second_name: string;
  person_photo_url?: string | null;
}

export interface PersonUpdate {
  first_name?: string;
  second_name?: string;
  person_photo_url?: string | null;
}

export type PersonSortBy = 'first_name' | 'second_name' | 'id';
export type SortOrder = 'asc' | 'desc';
export type SortBy = PersonSortBy;

export interface PersonsPaginatedResponse {
  items: Person[];
  total: number;
  page: number;
  items_per_page: number;
}
