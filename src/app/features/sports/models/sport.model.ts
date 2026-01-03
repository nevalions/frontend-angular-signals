export interface Sport {
  id: number;
  title: string;
  description?: string | null;
}

export interface SportCreate {
  title: string;
  description?: string | null;
}

export interface SportUpdate {
  title?: string;
  description?: string | null;
}
