import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationHelperService {
  private router = inject(Router);

  toTournamentsList(sportId: number | string, year: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments']);
  }

  toTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string): void {
    this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', tournamentId]);
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

  toTeamEdit(sportId: number | string, teamId: number | string): void {
    this.router.navigate(['/sports', sportId, 'teams', teamId, 'edit']);
  }

  toTeamCreate(sportId: number | string): void {
    this.router.navigate(['/sports', sportId, 'teams', 'new']);
  }
}
