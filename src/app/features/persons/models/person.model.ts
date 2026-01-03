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

export type SortBy = 'first_name' | 'second_name';
export type SortOrder = 'asc' | 'desc';
