import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TuiTextfield, TuiDialogService, TuiButton, TuiDataList, TuiIcon } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { Tournament } from '../../../tournaments/models/tournament.model';
import { Sport } from '../../models/sport.model';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-sport-parse-eesl',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule,
    TuiTextfield,
    TuiButton,
    TuiDataList,
    TuiSelect,
    TuiIcon,
    EntityHeaderComponent
  ],
  templateUrl: './sport-parse-eesl.component.html',
  styleUrl: './sport-parse-eesl.component.less',
})
export class SportParseEeslComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
  private readonly dialogs = inject(TuiDialogService);

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

  private userHasChangedSelection = signal(false);

  private initializeSeasonYear = effect(() => {
    const routeYear = this.seasonYearParam();
    const currentYear = this.eeslSeasonYear();
    const userChanged = this.userHasChangedSelection();

    console.log('Season year effect:', { routeYear, currentYear, userChanged });

    // Only preselect from route parameter if user hasn't manually selected
    if (!userChanged && routeYear && routeYear !== currentYear) {
      this.eeslSeasonYear.set(routeYear);
      console.log('Preselecting route year:', routeYear);
      return;
    }

    // Otherwise preselect current season if available (only if not already set by user)
    if (!userChanged && currentYear === null) {
      const seasons = this.seasonStore.seasons();
      const currentSeason = seasons.find(s => s.iscurrent);
      if (currentSeason) {
        this.eeslSeasonYear.set(currentSeason.year);
        console.log('Preselecting current season year:', currentSeason.year);
      }
    }
  });

  onSeasonChange(year: number | null): void {
    if (year) {
      this.userHasChangedSelection.set(true);
      this.eeslSeasonYear.set(year);
    }
  }

  parsedTournaments = signal<Tournament[]>([]);
  isParsing = signal(false);

  private readonly YEAR_TO_EESL_SEASON_ID: Record<number, number> = {
    2021: 1,
    2022: 5,
    2023: 7,
    2024: 8,
    2025: 9,
  };

  availableYears = computed(() => {
    const seasons = this.seasonStore.seasons();
    return seasons.map(s => s.year).sort((a, b) => b - a);
  });

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  selectedSeason = computed(() => {
    const year = this.eeslSeasonYear();
    if (!year) return null;
    return this.seasonStore.seasonByYear().get(year) || null;
  });

  parseSeason(): void {
    const eeslYear = this.eeslSeasonYear();
    const sportId = this.sportId();
    const season = this.selectedSeason();

    if (!eeslYear) {
      alert('Please select an EESL Season Year');
      return;
    }

    if (!sportId) {
      alert('Missing sport ID. Please navigate from a sport detail page.');
      return;
    }

    if (!season) {
      alert(`No season found for year ${eeslYear}. Please ensure a season exists.`);
      return;
    }

    const eeslSeasonId = this.YEAR_TO_EESL_SEASON_ID[eeslYear];
    if (!eeslSeasonId) {
      alert(`EESL season mapping not found for year ${eeslYear}. Supported years: ${Object.keys(this.YEAR_TO_EESL_SEASON_ID).join(', ')}`);
      return;
    }

    console.log('Parsing EESL season:', { eeslYear, eeslSeasonId, sportId, seasonId: season.id });

    this.isParsing.set(true);
    this.tournamentStore.parseAndCreateEESLSeason(eeslSeasonId, season.id, sportId).subscribe({
      next: (tournaments) => {
        this.parsedTournaments.set(tournaments);
        const message = `Successfully parsed and created ${tournaments.length} tournaments from EESL season ${eeslYear} (EESL ID: ${eeslSeasonId})`;
        this.dialogs.open(message, {
          label: 'Success',
          size: 'm'
        }).subscribe({
          complete: () => this.navigateBack()
        });
        this.isParsing.set(false);
      },
      error: (err) => {
        console.error('Error parsing and creating EESL season:', err);
        alert('Failed to parse and create EESL season. Please check year and try again.');
        this.isParsing.set(false);
      }
    });
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
