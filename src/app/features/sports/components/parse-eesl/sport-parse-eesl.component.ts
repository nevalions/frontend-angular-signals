import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { Tournament } from '../../../tournaments/models/tournament.model';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';

@Component({
  selector: 'app-sport-parse-eesl',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './sport-parse-eesl.component.html',
  styleUrl: './sport-parse-eesl.component.less',
})
export class SportParseEeslComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('sportId')))),
    { initialValue: null }
  );

  eeslSeasonYear = signal<number | null>(null);

  private seasonYearParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const yearStr = params.get('year');
      return yearStr ? Number(yearStr) : null;
    })),
    { initialValue: null }
  );

  private initializeSeasonYear = effect(() => {
    const current = this.currentSeason();
    const routeYear = this.seasonYearParam();
    const currentYear = this.eeslSeasonYear();
    
    console.log('Season year effect:', { current, routeYear, currentYear });
    
    // Preselect from route parameter if available
    if (routeYear && routeYear !== currentYear) {
      this.eeslSeasonYear.set(routeYear);
      console.log('Preselecting route year:', routeYear);
      return;
    }
    
    // Otherwise preselect current season (only if not already set by user)
    if (current && currentYear === null) {
      this.eeslSeasonYear.set(current.year);
      console.log('Preselecting current season year:', current.year);
    }
  });

  parsedTournaments = signal<Tournament[]>([]);
  isParsing = signal(false);
  showSuccessDialog = signal(false);
  successMessage = signal('');

  availableYears = computed(() => {
    const seasons = this.seasonStore.seasons();
    return seasons.map(s => s.year).sort((a, b) => b - a);
  });

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  currentSeason = computed(() => {
    const seasons = this.seasonStore.seasons();
    
    // First, try to find a season marked as current
    let season = seasons.find(s => s.iscurrent);
    
    // If no current season, fall back to the latest season (highest year)
    if (!season && seasons.length > 0) {
      season = seasons.reduce((latest, current) => 
        current.year > latest.year ? current : latest
      );
      console.log('No current season found, using latest season by year:', season);
    }
    
    return season || null;
  });

  parseSeason(): void {
    const eeslYear = this.eeslSeasonYear();
    const sportId = this.sportId();
    const season = this.currentSeason();

    if (!eeslYear) {
      alert('Please select an EESL Season Year');
      return;
    }

    if (!sportId) {
      alert('Missing sport ID. Please navigate from a sport detail page.');
      return;
    }

    if (!season) {
      alert('No current season found. Please ensure a season is marked as current.');
      return;
    }

    console.log('Parsing EESL season:', { eeslYear, sportId, seasonId: season.id });

    this.isParsing.set(true);
    this.tournamentStore.parseAndCreateEESLSeason(eeslYear, season.id, sportId).subscribe({
      next: (tournaments) => {
        this.parsedTournaments.set(tournaments);
        this.successMessage.set(`Successfully parsed and created ${tournaments.length} tournaments from EESL season ${eeslYear}`);
        this.showSuccessDialog.set(true);
        this.isParsing.set(false);
      },
      error: (err) => {
        console.error('Error parsing and creating EESL season:', err);
        alert('Failed to parse and create EESL season. Please check year and try again.');
        this.isParsing.set(false);
      }
    });
  }

  closeSuccessDialog(): void {
    this.showSuccessDialog.set(false);
    this.navigateBack();
  }

  navigateBack(): void {
    const sportId = this.sportId();
    if (sportId) {
      this.router.navigate(['/sports', sportId]);
    } else {
      this.router.navigate(['/sports']);
    }
  }
}
