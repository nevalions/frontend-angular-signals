import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService } from '@taiga-ui/core';
import { MatchStoreService } from '../../services/match-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { MatchCreate, MatchUpdate, Team } from '../../models/match.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { MatchFormComponent, MatchFormMode } from '../../../../shared/components/match-form/match-form.component';

@Component({
  selector: 'app-match-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatchFormComponent],
  templateUrl: './match-create.component.html',
  styleUrl: './match-create.component.less',
})
export class MatchCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private matchStore = inject(MatchStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private alerts = inject(TuiAlertService);
  private route = inject(ActivatedRoute);

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

  tournamentId = computed(() => {
    const id = this.route.snapshot.queryParamMap.get('tournamentId');
    return id ? Number(id) : null;
  });

  year = computed(() => {
    const year = this.route.snapshot.queryParamMap.get('year');
    return year ? Number(year) : null;
  });

  tournament = computed(() => {
    const tournamentId = this.tournamentId();
    return this.tournamentStore.tournaments().find((t) => t.id === tournamentId) || null;
  });

  teams = signal<Team[]>([]);
  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;
  loading = signal(false);

  mode: MatchFormMode = 'create';

  private loadTeamsOnTournamentChange = effect(() => {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.loading.set(true);
      this.tournamentStore.getTeamsByTournamentId(tournamentId).subscribe({
        next: (teams) => {
          this.teams.set(teams);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  });

  onSubmit(data: MatchCreate | MatchUpdate): void {
    if (this.mode === 'create') {
      withCreateAlert(
        this.alerts,
        () => this.matchStore.createMatch(data as MatchCreate),
        () => this.onSuccess(),
        'Match'
      );
    }
  }

  cancel(): void {
    const sportId = this.sportId();
    const tournamentId = this.tournamentId();
    const year = this.year();
    if (sportId && tournamentId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId, 'matches');
    }
  }

  onSuccess(): void {
    this.cancel();
  }
}
