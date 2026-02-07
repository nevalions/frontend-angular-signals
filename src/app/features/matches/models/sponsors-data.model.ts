export type SponsorPublic = {
  id: number | null;
  title: string | null;
  logo_url: string | null;
  scale_logo: number | null;
};

export type SponsorLineSponsorPublic = {
  position: number | null;
  sponsor: SponsorPublic | null;
};

export type SponsorLinePublic = {
  id: number | null;
  title: string | null;
  is_visible: boolean | null;
  sponsors: SponsorLineSponsorPublic[];
};

export type SponsorsData = {
  match: {
    main_sponsor: SponsorPublic | null;
    sponsor_line: SponsorLinePublic | null;
  };
  tournament: {
    main_sponsor: SponsorPublic | null;
    sponsor_line: SponsorLinePublic | null;
  };
};
