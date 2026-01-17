export interface Person {
  id: number;
  person_eesl_id?: number | null;
  first_name: string | null;
  second_name: string | null;
  person_photo_url: string | null;
  person_photo_web_url: string | null;
  person_photo_icon_url: string | null;
  person_dob: string | null;
  owner_user_id: number | null;
  isprivate: boolean;
}

export interface Sport {
  id: number;
  title: string;
  description?: string | null;
}

export interface Team {
  id: number;
  team_eesl_id?: number | null;
  title: string;
  city?: string | null;
  description?: string | null;
  team_logo_url?: string | null;
  team_logo_icon_url?: string | null;
  team_logo_web_url?: string | null;
  team_color: string;
  sponsor_line_id?: number | null;
  main_sponsor_id?: number | null;
  sport_id: number;
  isprivate: boolean;
  user_id?: number | null;
}

export interface Tournament {
  id: number;
  tournament_eesl_id?: number | null;
  title: string;
  season_id: number;
  sport_id: number;
  description?: string | null;
  tournament_logo_url?: string | null;
  tournament_logo_icon_url?: string | null;
  tournament_logo_web_url?: string | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
  isprivate: boolean;
  user_id?: number | null;
}

export interface Sponsor {
  id: number;
  title: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export interface SponsorLine {
  id: number;
  title: string;
  is_visible?: boolean | null;
}

export interface Position {
  id: number;
  title: string;
  category?: string | null;
  sport_id: number;
}

export interface Season {
  id: number;
  year: number;
  description?: string | null;
  iscurrent: boolean;
}
