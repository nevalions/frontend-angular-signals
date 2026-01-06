import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.less',
})
export class TournamentDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private readonly alerts = inject(TuiAlertService)
  private readonly dialogs = inject(TuiDialogService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  year = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  tournamentId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  season = computed(() => {
    const y = this.year();
    if (!y) return null;
    return this.seasonStore.seasonByYear().get(y) || null;
  });

  tournament = computed(() => {
    const id = this.tournamentId();
    if (!id) return null;
    return this.tournamentStore.tournaments().find((t) => t.id === id) || null;
  });

  loading = this.tournamentStore.loading;

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.year();
    if (sportId && year) {
      this.navigationHelper.toTournamentsList(sportId, year);
    }
  }

  navigateToEdit(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.navigationHelper.toTournamentDetail(sportId, year, id);
    }
  }

  deleteTournament(): void {
    const id = this.tournamentId();
    const tournament = this.tournament();
    if (!tournament || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete tournament "${tournament.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.tournamentStore.deleteTournament(id),
      () => this.navigateBack(),
      'Tournament'
    );
  }
}
