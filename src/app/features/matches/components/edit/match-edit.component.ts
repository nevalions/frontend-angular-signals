import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService } from '@taiga-ui/core';
import { MatchStoreService } from '../../services/match-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { MatchUpdate, MatchWithDetails, Team } from '../../models/match.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { MatchFormComponent, MatchFormMode } from '../../../../shared/components/match-form/match-form.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-match-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatchFormComponent],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.less',
})
export class MatchEditComponent implements OnInit {
  private navigationHelper = inject(NavigationHelperService);
  private matchStore = inject(MatchStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private alerts = inject(TuiAlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  matchId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  year = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  tournamentId = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('tournamentId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  match = signal<MatchWithDetails | null>(null);
  teams = signal<Team[]>([]);
  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;
  loading = signal(false);
  error = signal<string | null>(null);

  currentUser = this.authService.currentUser;

  canEdit = computed(() => {
    const match = this.match();
    const currentUser = this.currentUser();
    return currentUser?.roles?.includes('admin')
      || currentUser?.roles?.includes('editor')
      || match?.user_id === currentUser?.id;
  });

  private checkAccess = effect(() => {
    if (!this.canEdit()) {
      this.router.navigate(['/home']);
    }
  });

  mode: MatchFormMode = 'edit';

  ngOnInit(): void {
    this.loadMatch();
  }

  loadMatch(): void {
    const matchId = this.matchId();
    if (!matchId) return;

    this.loading.set(true);
    this.error.set(null);

    this.matchStore.getMatchById(matchId).subscribe({
      next: (match) => {
        this.match.set(match);
        this.loadTeams(match.tournament_id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load match');
        this.loading.set(false);
      }
    });
  }

  loadTeams(tournamentId: number | null | undefined): void {
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
  }

  onSubmit(data: MatchUpdate): void {
    const matchId = this.matchId();
    if (matchId) {
      withUpdateAlert(
        this.alerts,
        () => this.matchStore.updateMatch(matchId, data),
        () => this.onSuccess(),
        'Match'
      );
    }
  }

  cancel(): void {
    const sportId = this.sportId();
    const matchId = this.matchId();
    if (sportId && matchId) {
      this.navigationHelper.toMatchDetail(sportId, matchId, this.year() ?? undefined, this.tournamentId() ?? undefined);
    }
  }

  onSuccess(): void {
    this.cancel();
  }
}
