import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ComprehensiveMatchData, PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';
import { MatchStoreService } from '../../../services/match-store.service';
import { TuiAlertService, TuiIcon, tuiDialog } from '@taiga-ui/core';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';
import { PlayerMatchCreate, PlayerMatchUpdate } from '../../../models/player-match.model';
import { MatchAvailablePlayer } from '../../../models/available-player.model';
import { withCreateAlert } from '../../../../../core/utils/alert-helper.util';
import { MatchPlayerEditDialogComponent, MatchPlayerEditDialogResult, MatchPlayerEditDialogData } from './match-player-edit-dialog.component';
import { Observable } from 'rxjs';
import { MatchTeamRosterComponent } from './match-team-roster.component';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon, MatchTeamRosterComponent],
  template: `
    @if (comprehensiveData()) {
      <div class="match-players-tab">
        <div class="match-players-tab__comparison">
          <div class="match-players-tab__team-column">
            <app-match-team-roster
              [team]="comprehensiveData()!.teams.team_a"
              [teamLogoUrl]="getTeamLogo(comprehensiveData()!.teams.team_a)"
              [teamInitials]="getInitials(comprehensiveData()!.teams.team_a.title)"
              [addPlayerOpen]="addPlayerTeamAOpen()"
              [availablePlayers]="availablePlayersTeamA()"
              [availablePlayersLoading]="availablePlayersLoadingTeamA()"
              [availablePlayersError]="availablePlayersErrorTeamA()"
              [selectedAvailablePlayer]="selectedAvailablePlayerTeamA()"
              [sort]="teamASort()"
              [starters]="teamAStarters()"
              [bench]="teamABench()"
              [totalPlayers]="teamAPlayers().length"
              [hasDuplicateNumber]="hasDuplicateNumberTeamA"
              (toggleAddPlayer)="toggleAddPlayerForm('A')"
              (addPlayer)="addPlayerToMatch('A')"
              (sortChange)="setTeamSort('A', $event)"
              (selectedAvailablePlayerChange)="setSelectedAvailablePlayer('A', $event)"
              (openPlayer)="openPlayerDialog($event)"
              (togglePlayerStarting)="togglePlayerStarting($event.playerId, $event.isStarting)"
            />
          </div>

          <div class="match-players-tab__vs-divider">
            <span class="match-players-tab__vs-text">VS</span>
          </div>

          <div class="match-players-tab__team-column">
            <app-match-team-roster
              [team]="comprehensiveData()!.teams.team_b"
              [teamLogoUrl]="getTeamLogo(comprehensiveData()!.teams.team_b)"
              [teamInitials]="getInitials(comprehensiveData()!.teams.team_b.title)"
              [addPlayerOpen]="addPlayerTeamBOpen()"
              [availablePlayers]="availablePlayersTeamB()"
              [availablePlayersLoading]="availablePlayersLoadingTeamB()"
              [availablePlayersError]="availablePlayersErrorTeamB()"
              [selectedAvailablePlayer]="selectedAvailablePlayerTeamB()"
              [sort]="teamBSort()"
              [starters]="teamBStarters()"
              [bench]="teamBBench()"
              [totalPlayers]="teamBPlayers().length"
              [hasDuplicateNumber]="hasDuplicateNumberTeamB"
              (toggleAddPlayer)="toggleAddPlayerForm('B')"
              (addPlayer)="addPlayerToMatch('B')"
              (sortChange)="setTeamSort('B', $event)"
              (selectedAvailablePlayerChange)="setSelectedAvailablePlayer('B', $event)"
              (openPlayer)="openPlayerDialog($event)"
              (togglePlayerStarting)="togglePlayerStarting($event.playerId, $event.isStarting)"
            />
          </div>
        </div>
      </div>
    } @else {
      <div class="match-players-tab__loading">
        <div class="match-players-tab__loading-content">
          <tui-icon icon="@tui.loader" class="match-players-tab__loading-icon" />
          <span>Loading players...</span>
        </div>
      </div>
    }
  `,
  styleUrl: './match-players-tab.component.less',
})
export class MatchPlayersTabComponent {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);
  private matchStore = inject(MatchStoreService);
  private readonly alerts = inject(TuiAlertService);

  private readonly editPlayerDialog = tuiDialog(MatchPlayerEditDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Edit match player',
  }) as unknown as (data: MatchPlayerEditDialogData) => Observable<MatchPlayerEditDialogResult>;

  addPlayerTeamAOpen = signal(false);
  addPlayerTeamBOpen = signal(false);
  availablePlayersTeamA = signal<MatchAvailablePlayer[]>([]);
  availablePlayersTeamB = signal<MatchAvailablePlayer[]>([]);
  availablePlayersLoadingTeamA = signal(false);
  availablePlayersLoadingTeamB = signal(false);
  availablePlayersErrorTeamA = signal<string | null>(null);
  availablePlayersErrorTeamB = signal<string | null>(null);
  selectedAvailablePlayerTeamA = signal<MatchAvailablePlayer | null>(null);
  selectedAvailablePlayerTeamB = signal<MatchAvailablePlayer | null>(null);
  teamASort = signal<'number' | 'name'>('number');
  teamBSort = signal<'number' | 'name'>('number');

  private initiallyLoaded = signal(false);

  // Load available players when comprehensiveData becomes available
  private loadAvailablePlayersEffect = effect(() => {
    const data = this.comprehensiveData();
    if (data && !this.initiallyLoaded()) {
      this.loadAvailablePlayers('A');
      this.loadAvailablePlayers('B');
      this.initiallyLoaded.set(true);
    }
  });

  // Validate comprehensiveData input
  private syncEffect = effect(() => {
    const data = this.comprehensiveData();
    if (!data) {
      // Could add loading state here if needed
    }
  });

  teamAPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    const teamAId = data.teams.team_a.id;
    // FIXME: Backend bug - player.team_id is undefined, need to use player_team_tournament.team_id
    // Remove this workaround when STAF-220 is fixed
    const filtered = data.players.filter((p: PlayerMatchWithDetails) => {
      const playerTeamId = p.team_id ?? p.player_team_tournament?.team_id;
      return playerTeamId === teamAId;
    });
    return filtered;
  });

  teamBPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    const teamBId = data.teams.team_b.id;
    // FIXME: Backend bug - player.team_id is undefined, need to use player_team_tournament.team_id
    // Remove this workaround when STAF-220 is fixed
    return data.players.filter((p: PlayerMatchWithDetails) => {
      const playerTeamId = p.team_id ?? p.player_team_tournament?.team_id;
      return playerTeamId === teamBId;
    });
  });

  teamAStarters = computed(() =>
    this.sortTeamPlayers(
      this.teamAPlayers().filter(p => p.is_starting),
      this.teamASort()
    )
  );
  teamABench = computed(() =>
    this.sortTeamPlayers(
      this.teamAPlayers().filter(p => !p.is_starting),
      this.teamASort()
    )
  );
  teamBStarters = computed(() =>
    this.sortTeamPlayers(
      this.teamBPlayers().filter(p => p.is_starting),
      this.teamBSort()
    )
  );
  teamBBench = computed(() =>
    this.sortTeamPlayers(
      this.teamBPlayers().filter(p => !p.is_starting),
      this.teamBSort()
    )
  );

  readonly hasDuplicateNumberTeamA = (player: PlayerMatchWithDetails): boolean =>
    this.hasDuplicateNumber(player, 'A');
  readonly hasDuplicateNumberTeamB = (player: PlayerMatchWithDetails): boolean =>
    this.hasDuplicateNumber(player, 'B');

  compareByPlayerNumber(a: PlayerMatchWithDetails, b: PlayerMatchWithDetails): number {
    const numA = this.getPlayerNumberValue(a);
    const numB = this.getPlayerNumberValue(b);

    if (numA === null && numB === null) return 0;
    if (numA === null) return 1;
    if (numB === null) return -1;

    const numberA = parseInt(numA.toString(), 10);
    const numberB = parseInt(numB.toString(), 10);

    return numberA - numberB;
  }

  private getPlayerNumberValue(player: PlayerMatchWithDetails): string | null {
    return player.match_number || player.player_team_tournament?.player_number || null;
  }

  compareByPlayerName(a: PlayerMatchWithDetails, b: PlayerMatchWithDetails): number {
    const lastNameCompare = (a.person?.second_name || '').localeCompare(b.person?.second_name || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    return (a.person?.first_name || '').localeCompare(b.person?.first_name || '');
  }

  setTeamSort(team: 'A' | 'B', sort: 'number' | 'name'): void {
    if (team === 'A') {
      this.teamASort.set(sort);
    } else {
      this.teamBSort.set(sort);
    }
  }

  openPlayerDialog(player: PlayerMatchWithDetails): void {
    const sportId = this.getSportId();
    if (!sportId) {
      this.alerts.open('Sport is not available for this match', { label: 'Error', appearance: 'negative' }).subscribe();
      return;
    }

    const teamPlayers = this.getTeamPlayersFor(player);
    this.editPlayerDialog({ player, sportId, teamPlayers }).subscribe((result: MatchPlayerEditDialogResult | void) => {
      if (result?.updated || result?.deleted) {
        this.loadAvailablePlayers('A');
        this.loadAvailablePlayers('B');
      }
    });
  }

  hasDuplicateNumber(player: PlayerMatchWithDetails, team: 'A' | 'B'): boolean {
    const number = this.getPlayerNumberValue(player);
    if (!number) return false;
    const players = team === 'A' ? this.teamAPlayers() : this.teamBPlayers();
    const matches = players.filter(p => {
      const playerTeamId = p.team_id ?? p.player_team_tournament?.team_id;
      const myTeamId = player.team_id ?? player.player_team_tournament?.team_id;
      return this.getPlayerNumberValue(p) === number && myTeamId === playerTeamId;
    });
    return matches.length > 1;
  }

  private getTeamPlayersFor(player: PlayerMatchWithDetails): PlayerMatchWithDetails[] {
    const teamId = player.team_id ?? player.player_team_tournament?.team_id ?? null;
    const data = this.comprehensiveData();
    if (!data || !teamId) return [];
    if (teamId === data.teams.team_a.id) return this.teamAPlayers();
    if (teamId === data.teams.team_b.id) return this.teamBPlayers();
    return [];
  }

  private sortTeamPlayers(players: PlayerMatchWithDetails[], sort: 'number' | 'name'): PlayerMatchWithDetails[] {
    const sorted = [...players];
    if (sort === 'name') {
      sorted.sort((a, b) => this.compareByPlayerName(a, b));
    } else {
      sorted.sort((a, b) => this.compareByPlayerNumber(a, b));
    }
    return sorted;
  }

  toggleAddPlayerForm(team: 'A' | 'B'): void {
    const isOpen = team === 'A' ? this.addPlayerTeamAOpen() : this.addPlayerTeamBOpen();
    if (!isOpen) {
      this.loadAvailablePlayers(team);
    }
    this.setAddPlayerOpen(team, !isOpen);
  }

  cancelAddPlayer(team: 'A' | 'B'): void {
    this.setAddPlayerOpen(team, false);
    this.setSelectedAvailablePlayer(team, null);
  }

  addPlayerToMatch(team: 'A' | 'B'): void {
    const matchId = this.getMatchId();
    const teamId = this.getTeamId(team);
    const selected = this.getSelectedAvailablePlayer(team);
    if (!matchId || !teamId || !selected) return;

    const playerTeamTournamentId = selected.player_team_tournament?.id ?? selected.id;
    const data: PlayerMatchCreate = {
      match_id: matchId,
      team_id: teamId,
      player_team_tournament_id: playerTeamTournamentId,
      match_position_id: selected.position?.id ?? null,
    };

    withCreateAlert(
      this.alerts,
      () => this.matchStore.addPlayerToMatch(data),
      () => this.onAddPlayerSuccess(team),
      'Player'
    );
  }

  private onAddPlayerSuccess(team: 'A' | 'B'): void {
    this.cancelAddPlayer(team);
    // No manual refresh needed - WebSocket will update players automatically
    this.loadAvailablePlayers(team);
  }

  private loadAvailablePlayers(team: 'A' | 'B'): void {
    const matchId = this.getMatchId();
    const teamId = this.getTeamId(team);
    if (!matchId || !teamId) return;

    this.setAvailablePlayersLoading(team, true);
    this.setAvailablePlayersError(team, null);

    this.matchStore.getAvailablePlayersForTeamInMatch(matchId, teamId).subscribe({
      next: (players) => {
        const sortedPlayers = [...players].sort((a, b) => {
          const lastNameCompare = (a.person?.second_name || '').localeCompare(b.person?.second_name || '');
          if (lastNameCompare !== 0) return lastNameCompare;
          return (a.person?.first_name || '').localeCompare(b.person?.first_name || '');
        });
        this.setAvailablePlayers(team, sortedPlayers);
        this.setAvailablePlayersLoading(team, false);
      },
      error: () => {
        this.setAvailablePlayersError(team, 'Failed to load available players');
        this.setAvailablePlayers(team, []);
        this.setAvailablePlayersLoading(team, false);
      }
    });
  }


  private getMatchId(): number | null {
    return this.comprehensiveData()?.match?.id ?? null;
  }

  private getSportId(): number | null {
    const data = this.comprehensiveData();
    if (!data) return null;
    return (
      data.match?.tournament?.sport_id ??
      data.teams.team_a?.sport_id ??
      data.teams.team_b?.sport_id ??
      null
    );
  }

  private getTeamId(team: 'A' | 'B'): number | null {
    const data = this.comprehensiveData();
    if (!data) return null;
    return team === 'A' ? data.teams.team_a.id : data.teams.team_b.id;
  }

  private getSelectedAvailablePlayer(team: 'A' | 'B'): MatchAvailablePlayer | null {
    return team === 'A' ? this.selectedAvailablePlayerTeamA() : this.selectedAvailablePlayerTeamB();
  }

  private setSelectedAvailablePlayer(team: 'A' | 'B', player: MatchAvailablePlayer | null): void {
    if (team === 'A') {
      this.selectedAvailablePlayerTeamA.set(player);
    } else {
      this.selectedAvailablePlayerTeamB.set(player);
    }
  }

  private setAddPlayerOpen(team: 'A' | 'B', isOpen: boolean): void {
    if (team === 'A') {
      this.addPlayerTeamAOpen.set(isOpen);
    } else {
      this.addPlayerTeamBOpen.set(isOpen);
    }
  }

  private setAvailablePlayers(team: 'A' | 'B', players: MatchAvailablePlayer[]): void {
    if (team === 'A') {
      this.availablePlayersTeamA.set(players);
    } else {
      this.availablePlayersTeamB.set(players);
    }
  }

  private setAvailablePlayersLoading(team: 'A' | 'B', isLoading: boolean): void {
    if (team === 'A') {
      this.availablePlayersLoadingTeamA.set(isLoading);
    } else {
      this.availablePlayersLoadingTeamB.set(isLoading);
    }
  }


  private setAvailablePlayersError(team: 'A' | 'B', error: string | null): void {
    if (team === 'A') {
      this.availablePlayersErrorTeamA.set(error);
    } else {
      this.availablePlayersErrorTeamB.set(error);
    }
  }

  togglePlayerStarting(playerId: number, isStarting: boolean): void {
    const data: PlayerMatchUpdate = { is_starting: isStarting };

    // No optimistic updates - WebSocket provides real-time updates
    // Server is single source of truth for all connected clients
    this.matchStore.updatePlayerMatch(playerId, data).subscribe({
      next: () => {
        this.alerts.open(
          isStarting ? 'Player marked as starter' : 'Player moved to bench',
          { label: 'Success', appearance: 'success' }
        ).subscribe();
      },
      error: () => {
        this.alerts.open('Failed to update player status', { label: 'Error', appearance: 'error' }).subscribe();
      }
    });
  }

  getTeamLogo(team: { team_logo_url?: string | null }): string | null {
    return team.team_logo_url ? buildStaticUrlUtil(team.team_logo_url) : null;
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
