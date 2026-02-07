import { Sponsor, SponsorLine } from '../../../shared/types';
import { ComprehensiveMatchData } from '../models/comprehensive-match.model';
import { SponsorLinePublic, SponsorPublic, SponsorsData } from '../models/sponsors-data.model';

export function toSponsor(sponsor: SponsorPublic | null | undefined): Sponsor | null {
  if (!sponsor) return null;

  return {
    id: sponsor.id ?? 0,
    title: sponsor.title ?? '',
    logo_url: sponsor.logo_url ?? null,
    scale_logo: sponsor.scale_logo ?? null,
  };
}

export function toSponsorLine(line: SponsorLinePublic | null | undefined): SponsorLine | null {
  if (!line) return null;

  return {
    id: line.id ?? 0,
    title: line.title ?? '',
    is_visible: line.is_visible ?? null,
  };
}

function readSponsorsData(data: ComprehensiveMatchData | null): SponsorsData | null {
  return data?.sponsors_data ?? null;
}

export function selectTournamentMainSponsor(data: ComprehensiveMatchData | null): Sponsor | null {
  const sponsorsData = readSponsorsData(data);
  if (sponsorsData) {
    return toSponsor(sponsorsData.tournament?.main_sponsor);
  }

  return data?.match?.tournament?.main_sponsor ?? null;
}

export function selectTournamentSponsorLine(data: ComprehensiveMatchData | null): SponsorLine | null {
  const sponsorsData = readSponsorsData(data);
  if (sponsorsData) {
    return toSponsorLine(sponsorsData.tournament?.sponsor_line);
  }

  return data?.match?.tournament?.sponsor_line ?? null;
}

export function selectMatchMainSponsor(data: ComprehensiveMatchData | null): Sponsor | null {
  const sponsorsData = readSponsorsData(data);
  if (sponsorsData) {
    return toSponsor(sponsorsData.match?.main_sponsor);
  }

  return data?.match?.main_sponsor ?? null;
}

export function selectMatchSponsorLine(data: ComprehensiveMatchData | null): SponsorLine | null {
  const sponsorsData = readSponsorsData(data);
  if (sponsorsData) {
    return toSponsorLine(sponsorsData.match?.sponsor_line);
  }

  return data?.match?.sponsor_line ?? null;
}
