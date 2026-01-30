import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, OnDestroy, DestroyRef, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiAlertService, TuiDialogService, TuiButton } from '@taiga-ui/core';
import { MatchStoreService } from '../../services/match-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { ConnectionIndicatorComponent } from '../../../../shared/components/connection-indicator/connection-indicator.component';
import { MatchPlayersTabComponent } from './tabs/match-players-tab.component';
import { MatchEventsTabComponent } from './tabs/match-events-tab.component';
import { MatchStatsTabComponent } from './tabs/match-stats-tab.component';
import { MatchWithDetails } from '../../models/match.model';
import { ComprehensiveMatchData } from '../../models/comprehensive-match.model';
import { Scoreboard } from '../../models/scoreboard.model';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { DateService } from '../../../../core/services/date.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { createNumberParamSignal, createStringParamSignal } from '../../../../core/utils/route-param-helper.util';
import { TabsNavComponent, TabsNavItem } from '../../../../shared/components/tabs-nav/tabs-nav.component';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityHeaderComponent, TabsNavComponent, MatchPlayersTabComponent, MatchEventsTabComponent, MatchStatsTabComponent, TuiButton, ConnectionIndicatorComponent],
  templateUrl: './match-detail.component.html',
  styleUrl: './match-detail.component.less',
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchStore = inject(MatchStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private dateService = inject(DateService);
  private wsService = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);

  sportId = createNumberParamSignal(this.route, 'sportId');

  matchId = createNumberParamSignal(this.route, 'id');

  year = createNumberParamSignal(this.route, 'year', { source: 'queryParamMap' });

  tournamentId = createNumberParamSignal(this.route, 'tournamentId', { source: 'queryParamMap' });

  match = signal<MatchWithDetails | null>(null);
  comprehensiveData = signal<ComprehensiveMatchData | null>(null);
  scoreboard = signal<Scoreboard | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  activeTab = createStringParamSignal(this.route, 'tab', {
    source: 'queryParamMap',
    defaultValue: 'players',
  });

  matchTitle = computed(() => {
    const m = this.match();
    if (!m) return '';
    return `${m.team_a?.title || 'Team A'} vs ${m.team_b?.title || 'Team B'}`;
  });

  scoreDisplay = computed(() => {
    const md = this.comprehensiveData()?.match_data;
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

  readonly tabs: TabsNavItem[] = [
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
    this.connectWebSocket();
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

    // Data will be loaded via WebSocket initial-load message
    // No HTTP calls needed here
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
      this.navigationHelper.toScoreboardAdmin(matchId);
    }
  }

  navigateToScoreboardView(): void {
    const matchId = this.matchId();
    if (matchId) {
      window.open(`/scoreboard/match/${matchId}/hd`, '_blank');
    }
  }

  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  private connectWebSocket(): void {
    const id = this.matchId();
    if (id) {
      this.wsService.connect(id);
    }
  }

  private wsInitialLoadEffect = effect(() => {
    const message = this.wsService.matchData();
    if (!message) return;

    const current = untracked(() => this.comprehensiveData());

    if (!current && message['teams']) {
      this.comprehensiveData.set({
        ...message,
        players: message['players'] || [],
        events: message['events'] || [],
      } as unknown as ComprehensiveMatchData);
      this.loading.set(false);
    }

    if (message['match']) {
      this.match.set(message['match'] as MatchWithDetails);
    }

    if (message.scoreboard) {
      this.scoreboard.set(message.scoreboard as Scoreboard);
    }

    if (!current) return;
  });

  private wsMatchDataPartialEffect = effect(() => {
    const partial = this.wsService.matchDataPartial();
    if (!partial) return;

    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    this.comprehensiveData.set({
      ...current,
      match_data: partial,
    });
  });

  private wsMatchPartialEffect = effect(() => {
    const partial = this.wsService.matchPartial();
    if (!partial) return;

    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    this.comprehensiveData.set({
      ...current,
      match: partial,
      // Preserve players and events when updating match metadata
      players: current.players,
      events: current.events,
    });

    this.match.set(partial);
  });

  private wsTeamsPartialEffect = effect(() => {
    const partial = this.wsService.teamsPartial();
    if (!partial) return;

    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    this.comprehensiveData.set({
      ...current,
      teams: partial,
      // Preserve players and events when updating teams
      players: current.players,
      events: current.events,
    });
  });

  private wsPlayersPartialEffect = effect(() => {
    const players = this.wsService.playersPartial();
    if (!players) return;

    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    if (JSON.stringify(current.players) !== JSON.stringify(players)) {
      this.comprehensiveData.set({
        ...current,
        players,
      });
    }
  });

  private wsEventsPartialEffect = effect(() => {
    const events = this.wsService.eventsPartial();
    if (!events) return;

    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    if (JSON.stringify(current.events) !== JSON.stringify(events)) {
      this.comprehensiveData.set({
        ...current,
        events,
      });
    }
  });

  private wsEventsEffect = effect(() => {
    const events = this.wsService.events();
    const current = untracked(() => this.comprehensiveData());
    if (!current) return;

    if (JSON.stringify(current.events) !== JSON.stringify(events)) {
      this.comprehensiveData.set({
        ...current,
        events: [...events],
      });
    }
  });
}
