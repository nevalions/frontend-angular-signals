export interface Sponsor {
  id: number;
  title: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export interface SponsorCreate {
  title: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export interface SponsorUpdate {
  title?: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}
