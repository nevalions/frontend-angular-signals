import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, UpperCasePipe, TuiTextfield, TuiChevron, TuiSelect, TuiDataList, TuiButton],
  templateUrl: './sport-detail.component.html',
  styleUrl: './sport-detail.component.less',
})
export class SportDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  activeTab = 'tournaments';

  selectedSeasonYear = signal<number | null>(null);

  tournaments = computed(() => {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (!sportId || !year) return [];

    const key = `${sportId}-${year}`;
    return this.tournamentStore.tournamentsBySportAndSeason().get(key) || [];
  });

  navigateBack(): void {
    this.navigationHelper.toSportsList();
  }

  navigateToEdit(): void {
    const id = this.sportId();
    if (id) {
      this.navigationHelper.toSportEdit(id);
    }
  }

  deleteSport(): void {
    const id = this.sportId();
    const sport = this.sport();
    if (!sport || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete sport "${sport.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.sportStore.deleteSport(id),
      () => this.navigateBack(),
      'Sport'
    );
  }

  navigateToTournaments(seasonYear: number): void {
    const id = this.sportId();
    if (id) {
      this.router.navigate(['/sports', id, 'seasons', seasonYear, 'tournaments']);
    }
  }

  onSeasonChange(year: number): void {
    this.selectedSeasonYear.set(year);
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  navigateToTournamentDetail(tournamentId: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId);
    }
  }
}
