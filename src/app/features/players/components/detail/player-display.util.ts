import { PlayerWithDetailsAndPhotos, PlayerWithPersonAndTournaments, PlayerDetailInTournamentResponse } from '../../models/player.model';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { capitalizeName as capitalizeNameUtil } from '../../../../core/utils/string-helper.util';

export type PlayerDetailData = PlayerWithDetailsAndPhotos | PlayerWithPersonAndTournaments | PlayerDetailInTournamentResponse;

interface PersonBasic {
  id: number;
  first_name: string | null;
  second_name: string | null;
  person_photo_icon_url: string | null;
  person_photo_web_url: string | null;
}

export function getPlayerName(player: PlayerDetailData | null): string {
  if (!player) return '';
  
  const firstName = getFirstName(player);
  const secondName = getSecondName(player);
  
  return (firstName || secondName) ? `${firstName || ''} ${secondName || ''}`.trim() : '';
}

export function getPlayerInitials(player: PlayerDetailData | null): string {
  if (!player) return '';
  
  const firstName = getFirstName(player);
  const secondName = getSecondName(player);
  
  const capFirstName = capitalizeNameUtil(firstName);
  const capSecondName = capitalizeNameUtil(secondName);
  
  let initials = '';
  if (capFirstName && capFirstName[0]) {
    initials += capFirstName[0].toUpperCase();
  }
  if (capSecondName && capSecondName[0]) {
    initials += capSecondName[0].toUpperCase();
  }
  return initials;
}

export function getPersonPhotoIconUrl(player: PlayerDetailData | null): string | null {
  if (!player) return null;
  
  const url = personIconUrl(player);
  if (!url) return null;
  return buildStaticUrl(url);
}

export function getPersonPhotoWebUrl(player: PlayerDetailData | null): string | null {
  if (!player) return null;
  
  const url = personWebUrl(player);
  if (!url) return null;
  return buildStaticUrl(url);
}

export function getPersonId(player: PlayerDetailData | null): number | null {
  if (!player) return null;
  
  const person = getPerson(player);
  return person?.id || null;
}

function getPerson(player: PlayerDetailData): PersonBasic | null {
  if (hasPersonProperty(player)) {
    return (player as PlayerWithPersonAndTournaments | PlayerDetailInTournamentResponse).person || null;
  }
  return null;
}

function getFirstName(player: PlayerDetailData): string | null {
  if (hasDirectNameFields(player)) {
    return (player as PlayerWithDetailsAndPhotos).first_name || null;
  }
  
  const person = getPerson(player);
  return person?.first_name || null;
}

function getSecondName(player: PlayerDetailData): string | null {
  if (hasDirectNameFields(player)) {
    return (player as PlayerWithDetailsAndPhotos).second_name || null;
  }
  
  const person = getPerson(player);
  return person?.second_name || null;
}

function personIconUrl(player: PlayerDetailData): string | null {
  if (hasDirectNameFields(player)) {
    return (player as PlayerWithDetailsAndPhotos).person_photo_icon_url || null;
  }
  
  const person = getPerson(player);
  return person?.person_photo_icon_url || null;
}

function personWebUrl(player: PlayerDetailData): string | null {
  if (hasDirectNameFields(player)) {
    return null;
  }
  
  const person = getPerson(player);
  if (person?.person_photo_web_url) {
    return person.person_photo_web_url;
   }
  
  if (hasPersonInTournamentResponse(player)) {
    return (player as PlayerDetailInTournamentResponse).person?.person_photo_web_url || null;
  }
  
  return null;
}

function hasDirectNameFields(player: PlayerDetailData): boolean {
  return 'first_name' in player && !('person' in player);
}

function hasPersonProperty(player: PlayerDetailData): boolean {
  return 'person' in player;
}

function hasPersonInTournamentResponse(player: PlayerDetailData): boolean {
  return 'tournament_assignment' in player;
}
