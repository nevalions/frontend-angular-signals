import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationHelperService {
  private router = inject(Router);

  toTournamentsList(sportId: number | string, year: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments']);
  }

  toTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string, tab?: string): void {
    const params = tab ? { queryParams: { tab } } : {};
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', tournamentId], params);
  }

  toTournamentEdit(sportId: number | string, year: number | string, tournamentId: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', tournamentId, 'edit']);
  }

  toTournamentCreate(sportId: number | string, year: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', 'new']);
  }

  toSportDetail(sportId: number | string, year?: number | string, tab?: string): void {
    const queryParams: { year?: number | string; tab?: string } = {};
    if (year) queryParams.year = year;
    if (tab) queryParams.tab = tab;
    this.router.navigate(['/sports', sportId], { queryParams });
  }

  toSportEdit(sportId: number | string): void {
    this.router.navigate(['/sports', sportId, 'edit']);
  }

  toSportsList(): void {
    this.router.navigate(['/sports']);
  }

  toHome(): void {
    this.router.navigate(['/home']);
  }

  toError404(): void {
    this.router.navigate(['/error404']);
  }

  toPersonsList(): void {
    this.router.navigate(['/persons']);
  }

  toSponsorsList(): void {
    this.router.navigate(['/sponsors']);
  }

  toSponsorDetail(id: number | string): void {
    this.router.navigate(['/sponsors', id]);
  }

  toSponsorCreate(): void {
    this.router.navigate(['/sponsors', 'new']);
  }

  toSponsorEdit(id: number | string): void {
    this.router.navigate(['/sponsors', id, 'edit']);
  }

  toPersonDetail(id: number | string): void {
    this.router.navigate(['/persons', id]);
  }

  toPersonEdit(id: number | string): void {
    this.router.navigate(['/persons', id, 'edit']);
  }

  toPersonCreate(): void {
    this.router.navigate(['/persons', 'new']);
  }

  toTeamDetail(sportId: number | string, teamId: number | string, year?: number | string): void {
    const params = year ? { queryParams: { year } } : {};
    this.router.navigate(['/sports', sportId, 'teams', teamId], params);
  }

  toTeamInTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string, teamId: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', tournamentId, 'teams', teamId]);
  }

  toTeamEdit(sportId: number | string, teamId: number | string): void {
    this.router.navigate(['/sports', sportId, 'teams', teamId, 'edit']);
  }

  toTeamCreate(sportId: number | string): void {
    this.router.navigate(['/sports', sportId, 'teams', 'new']);
  }

  toPlayerDetail(sportId: number | string, playerId: number | string, fromSport?: boolean, tournamentId?: number | string, year?: number | string): void {
    const queryParams: { fromSport?: string; tournamentId?: string; year?: string } = {};
    if (fromSport !== undefined) queryParams.fromSport = fromSport.toString();
    if (tournamentId) queryParams.tournamentId = tournamentId.toString();
    if (year) queryParams.year = year.toString();
    this.router.navigate(['/sports', sportId, 'players', playerId], { queryParams });
  }

  toPlayerDetailFromTournament(sportId: number | string, year: number | string, tournamentId: number | string, playerId: number | string): void {
    this.toPlayerDetail(sportId, playerId, false, tournamentId, year);
  }

  toPlayerDetailFromSport(sportId: number | string, playerId: number | string): void {
    this.toPlayerDetail(sportId, playerId, true);
  }

  toMatchDetail(sportId: number | string, matchId: number | string, year?: number | string, tournamentId?: number | string): void {
    const queryParams: { year?: number | string; tournamentId?: number | string } = {};
    if (year) queryParams.year = year.toString();
    if (tournamentId) queryParams.tournamentId = tournamentId.toString();
    this.router.navigate(['/sports', sportId, 'matches', matchId], { queryParams });
  }

  toMatchCreate(sportId: number | string, tournamentId: number | string, year?: number | string): void {
    const queryParams: { year?: number | string; tournamentId?: number | string } = {};
    if (year) queryParams.year = year.toString();
    if (tournamentId) queryParams.tournamentId = tournamentId.toString();
    this.router.navigate(['/sports', sportId, 'matches', 'new'], { queryParams });
  }

  toMatchEdit(sportId: number | string, matchId: number | string): void {
    this.router.navigate(['/sports', sportId, 'matches', matchId, 'edit']);
  }

  toScoreboardAdmin(matchId: number | string): void {
    this.router.navigate(['/scoreboard', 'match', matchId, 'admin']);
  }

  toScoreboardView(matchId: number | string): void {
    this.router.navigate(['/scoreboard', 'match', matchId, 'hd']);
  }

  toSettings(): void {
    this.router.navigate(['/settings']);
  }

  toUserProfile(userId: number | string, fromSettings?: boolean): void {
    const queryParams = fromSettings !== undefined ? { queryParams: { fromSettings: fromSettings.toString() } } : {};
    this.router.navigate(['/users', userId], queryParams);
  }
}
