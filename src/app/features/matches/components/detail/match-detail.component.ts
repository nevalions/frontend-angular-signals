import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiDialogService, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiSegmented } from '@taiga-ui/kit';
import { MatchStoreService } from '../../services/match-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { MatchPlayersTabComponent } from './tabs/match-players-tab.component';
import { MatchEventsTabComponent } from './tabs/match-events-tab.component';
import { MatchStatsTabComponent } from './tabs/match-stats-tab.component';
import { MatchWithDetails } from '../../models/match.model';
import { MatchData } from '../../models/match-data.model';
import { ComprehensiveMatchData } from '../../models/comprehensive-match.model';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { DateService } from '../../../../core/services/date.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityHeaderComponent, MatchPlayersTabComponent, MatchEventsTabComponent, MatchStatsTabComponent, TuiButton, TuiIcon, TuiSegmented],
  templateUrl: './match-detail.component.html',
  styleUrl: './match-detail.component.less',
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchStore = inject(MatchStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private dateService = inject(DateService);

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
  matchData = signal<MatchData | null>(null);
  comprehensiveData = signal<ComprehensiveMatchData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  activeTab = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('tab') || 'players')),
    { initialValue: 'players' }
  );

  matchTitle = computed(() => {
    const m = this.match();
    if (!m) return '';
    return `${m.team_a?.title || 'Team A'} vs ${m.team_b?.title || 'Team B'}`;
  });

  scoreDisplay = computed(() => {
    const md = this.matchData();
    if (md?.score_team_a !== null && md?.score_team_a !== undefined &&
        md?.score_team_b !== null && md?.score_team_b !== undefined) {
      return `${md.score_team_a}:${md.score_team_b}`;
    }
    return '0:0';
  });

  formattedDate = computed(() => {
    const m = this.match();
    if (!m?.match_date) return 'Unknown date';
    return this.dateService.formatDateTime(m.match_date);
  });

  activeTabIndex = computed(() => {
    const tab = this.activeTab();
    const tabs = ['players', 'events', 'stats'];
    return tabs.indexOf(tab);
  });

  readonly tabs = [
    { label: 'Players', value: 'players', icon: '@tui.user' },
    { label: 'Events', value: 'events', icon: '@tui.calendar' },
    { label: 'Stats', value: 'stats', icon: '@tui.chart-bar' },
  ];

  teamALogoUrl = computed(() => {
    const m = this.match();
    return m?.team_a?.team_logo_icon_url ? buildStaticUrl(m.team_a.team_logo_icon_url) : null;
  });

  teamBLogoUrl = computed(() => {
    const m = this.match();
    return m?.team_b?.team_logo_icon_url ? buildStaticUrl(m.team_b.team_logo_icon_url) : null;
  });

  tournamentLogoUrl = computed(() => {
    const m = this.match();
    return m?.tournament?.tournament_logo_icon_url ? buildStaticUrl(m.tournament.tournament_logo_icon_url) : null;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const id = this.matchId();
    if (!id) {
      this.error.set('Invalid match ID');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.matchStore.getComprehensiveMatchData(id).subscribe({
      next: (data) => {
        this.match.set(data.match);
        this.matchData.set(data.match_data);
        this.comprehensiveData.set(data);
        this.loading.set(false);
      },
      error: (_err) => {
        this.error.set('Failed to load match');
        this.loading.set(false);
      }
    });
  }

  navigateBack(): void {
    const sportId = this.sportId();
    const tournamentId = this.tournamentId();
    const year = this.year();

    if (sportId && tournamentId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId, 'matches');
    } else if (sportId && year) {
      this.navigationHelper.toSportDetail(sportId, year);
    } else {
      this.navigationHelper.toHome();
    }
  }

  navigateToEdit(): void {
    const sportId = this.sportId();
    const matchId = this.matchId();
    if (sportId && matchId) {
      this.navigationHelper.toMatchEdit(sportId, matchId);
    }
  }

  deleteMatch(): void {
    const id = this.matchId();
    const match = this.match();
    if (!match || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete match "${this.matchTitle()}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.matchStore.deleteMatch(id),
      () => this.navigateBack(),
      'Match'
    );
  }

  navigateToTournament(): void {
    const tournament = this.match()?.tournament;
    if (tournament) {
      this.navigationHelper.toTournamentDetail(tournament.sport_id, this.year() || new Date().getFullYear(), tournament.id);
    }
  }

  navigateToScoreboardAdmin(): void {
    const matchId = this.matchId();
    if (matchId) {
      this.router.navigate(['/scoreboard', 'match', matchId, 'admin']);
    }
  }

  navigateToScoreboardView(): void {
    const matchId = this.matchId();
    if (matchId) {
      this.router.navigate(['/scoreboard', 'match', matchId, 'hd']);
    }
  }

  onTabChange(index: number): void {
    const tab = this.tabs[index].value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
