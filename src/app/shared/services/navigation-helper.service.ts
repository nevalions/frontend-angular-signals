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

  toSportDetail(sportId: number | string): void {
    this.router.navigate(['/sports', sportId]);
  }

  toSportEdit(sportId: number | string): void {
    this.router.navigate(['/sports', sportId, 'edit']);
  }

  toSportsList(): void {
    this.router.navigate(['/sports']);
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
}
