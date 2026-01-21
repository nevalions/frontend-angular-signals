import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprehensiveMatchData, PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';
import { MatchStoreService } from '../../../services/match-store.service';
import { TuiAvatar, TuiBadge, TuiChip, TuiStatus, TuiSwitch, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { TuiAppearance, TuiIcon, TuiSurface, TuiTitle, TuiAlertService, TuiButton, TuiTextfield, TuiDataList } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';
import { PlayerMatchCreate, PlayerMatchUpdate } from '../../../models/player-match.model';
import { MatchAvailablePlayer } from '../../../models/available-player.model';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';
import { withCreateAlert } from '../../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CommonModule,
    TuiAvatar,
    TuiBadge,
    TuiChip,
    TuiStatus,
    TuiTitle,
    TuiIcon,
    TuiAppearance,
    TuiSurface,
    TuiCardLarge,
    TuiHeader,
    TuiSwitch,
    TuiTextfield,
    TuiButton,
    TuiDataList,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe,
  ],
  template: `
    @if (comprehensiveData()) {
      <div class="match-players-tab">
        <!-- Side-by-side team comparison layout -->
        <div class="match-players-tab__comparison">
          <!-- Team A Section -->
          <div class="match-players-tab__team-column">
            <div tuiCardLarge tuiSurface="floating" class="match-players-tab__team-card">
              <header tuiHeader class="match-players-tab__team-header">
                <tui-avatar
                  [src]="getTeamLogo(comprehensiveData()!.teams.team_a)"
                  size="l"
                  class="match-players-tab__team-avatar"
                >
                  {{ getInitials(comprehensiveData()!.teams.team_a.title) }}
                </tui-avatar>
                <hgroup tuiTitle>
                  <h3>{{ comprehensiveData()!.teams.team_a.title.toUpperCase() }}</h3>
                </hgroup>
              </header>

              <div class="match-players-tab__team-actions">
                <button
                  type="button"
                  tuiButton
                  appearance="primary"
                  size="s"
                  iconStart="@tui.plus"
                  class="match-players-tab__add-button"
                  (click)="toggleAddPlayerForm('A')">
                  @if (addPlayerTeamAOpen()) {
                    Cancel
                  } @else {
                    Add Player
                  }
                </button>
              </div>

              @if (addPlayerTeamAOpen()) {
                <div class="match-players-tab__add-form">
                  <div class="match-players-tab__add-field">
                    <tui-textfield
                      tuiChevron
                      iconStart="@tui.search"
                      [stringify]="stringifyAvailablePlayer"
                      tuiTextfieldSize="m">
                      <label tuiLabel>Search available players</label>
                      <input
                        placeholder="Search by number or name..."
                        tuiComboBox
                        [(ngModel)]="selectedAvailablePlayerTeamA"
                        [disabled]="availablePlayersLoadingTeamA()" />
                      <tui-data-list *tuiTextfieldDropdown size="l" class="match-players-tab__dropdown-list">
                        @if (availablePlayersLoadingTeamA()) {
                          <div class="match-players-tab__dropdown-loading">Loading available players...</div>
                        } @else if (availablePlayersErrorTeamA()) {
                          <div class="match-players-tab__dropdown-error">{{ availablePlayersErrorTeamA() }}</div>
                        } @else if (availablePlayersTeamA().length === 0) {
                          <div class="match-players-tab__dropdown-empty">No available players</div>
                        } @else {
                          @for (player of availablePlayersTeamA() | tuiFilterByInput; track player.id) {
                            <button
                              new
                              tuiOption
                              type="button"
                              [value]="player"
                              class="match-players-tab__dropdown-option">
                              {{ stringifyAvailablePlayer(player) }}
                            </button>
                          }
                        }
                      </tui-data-list>
                    </tui-textfield>
                  </div>
                  <div class="match-players-tab__add-actions">
                    <button
                      type="button"
                      tuiButton
                      appearance="primary"
                      size="s"
                      [disabled]="!selectedAvailablePlayerTeamA()"
                      (click)="addPlayerToMatch('A')">
                      Add to Match
                    </button>
                    <button
                      type="button"
                      tuiButton
                      appearance="flat"
                      size="s"
                      (click)="cancelAddPlayer('A')">
                      Cancel
                    </button>
                  </div>
                </div>
              }

              <!-- Starters Section -->
              @if (teamAStarters().length > 0) {
                <div class="match-players-tab__roster-section">
                  <div class="match-players-tab__section-header">
                    <tui-icon icon="@tui.star" class="match-players-tab__section-icon match-players-tab__section-icon--starter" />
                    <span class="match-players-tab__section-title">Starting Lineup</span>
                    <tui-badge appearance="positive" size="s" tuiStatus>
                      {{ teamAStarters().length }}
                    </tui-badge>
                  </div>
                  <div class="match-players-tab__players-list">
                    @for (player of teamAStarters(); track player.id) {
                        <div tuiSurface="neutral" class="match-players-tab__player-card">
                          <div class="match-players-tab__player-main">
                          <div class="match-players-tab__player-meta">
                            <div class="match-players-tab__player-number-badge">
                              {{ player.player_team_tournament?.player_number || '-' }}
                            </div>
                            @if (player.position) {
                              <span class="match-players-tab__position-text match-players-tab__position-text--under-number">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            <label class="match-players-tab__player-switch">
                              <input
                                type="checkbox"
                                tuiSwitch
                                [ngModel]="player.is_starting || false"
                                (ngModelChange)="togglePlayerStarting(player.id, $event)"
                                class="match-players-tab__switch" 
                              />
                              <span class="match-players-tab__player-switch-label">
                                {{ player.is_starting ? 'Remove from starters' : 'Add to starters' }}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Bench Section -->
              @if (teamABench().length > 0) {
                <div class="match-players-tab__roster-section">
                  <div class="match-players-tab__section-header">
                    <tui-icon icon="@tui.users" class="match-players-tab__section-icon" />
                    <span class="match-players-tab__section-title">Bench</span>
                    <tui-badge appearance="neutral" size="s">
                      {{ teamABench().length }}
                    </tui-badge>
                  </div>
                  <div class="match-players-tab__players-list match-players-tab__players-list--bench">
                    @for (player of teamABench(); track player.id) {
                      <div tuiSurface class="match-players-tab__player-card match-players-tab__player-card--bench">
                        <div class="match-players-tab__player-main">
                          <div class="match-players-tab__player-meta match-players-tab__player-meta--bench">
                            <div class="match-players-tab__player-number-badge match-players-tab__player-number-badge--bench">
                              {{ player.player_team_tournament?.player_number || '-' }}
                            </div>
                            @if (player.position) {
                              <span class="match-players-tab__position-text match-players-tab__position-text--under-number">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name match-players-tab__player-name--bench">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            <label class="match-players-tab__player-switch match-players-tab__player-switch--bench">
                              <input
                                type="checkbox"
                                tuiSwitch
                                [ngModel]="player.is_starting || false"
                                (ngModelChange)="togglePlayerStarting(player.id, $event)"
                                class="match-players-tab__switch"
                              />
                              <span class="match-players-tab__player-switch-label">
                                {{ player.is_starting ? 'Remove from starters' : 'Add to starters' }}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (teamAPlayers().length === 0) {
                <div class="match-players-tab__empty-roster">
                  <tui-icon icon="@tui.users" class="match-players-tab__empty-icon" />
                  <span>No players registered</span>
                </div>
              }
            </div>
          </div>

          <!-- VS Divider -->
          <div class="match-players-tab__vs-divider">
            <span class="match-players-tab__vs-text">VS</span>
          </div>

          <!-- Team B Section -->
          <div class="match-players-tab__team-column">
            <div tuiCardLarge tuiSurface="floating" class="match-players-tab__team-card">
              <header tuiHeader class="match-players-tab__team-header">
                <tui-avatar
                  [src]="getTeamLogo(comprehensiveData()!.teams.team_b)"
                  size="l"
                  class="match-players-tab__team-avatar"
                >
                  {{ getInitials(comprehensiveData()!.teams.team_b.title) }}
                </tui-avatar>
                <hgroup tuiTitle>
                  <h3>{{ comprehensiveData()!.teams.team_b.title.toUpperCase() }}</h3>
                </hgroup>
              </header>

              <div class="match-players-tab__team-actions">
                <button
                  type="button"
                  tuiButton
                  appearance="primary"
                  size="s"
                  iconStart="@tui.plus"
                  class="match-players-tab__add-button"
                  (click)="toggleAddPlayerForm('B')">
                  @if (addPlayerTeamBOpen()) {
                    Cancel
                  } @else {
                    Add Player
                  }
                </button>
              </div>

              @if (addPlayerTeamBOpen()) {
                <div class="match-players-tab__add-form">
                  <div class="match-players-tab__add-field">
                    <tui-textfield
                      tuiChevron
                      iconStart="@tui.search"
                      [stringify]="stringifyAvailablePlayer"
                      tuiTextfieldSize="m">
                      <label tuiLabel>Search available players</label>
                      <input
                        placeholder="Search by number or name..."
                        tuiComboBox
                        [(ngModel)]="selectedAvailablePlayerTeamB"
                        [disabled]="availablePlayersLoadingTeamB()" />
                      <tui-data-list *tuiTextfieldDropdown size="l" class="match-players-tab__dropdown-list">
                        @if (availablePlayersLoadingTeamB()) {
                          <div class="match-players-tab__dropdown-loading">Loading available players...</div>
                        } @else if (availablePlayersErrorTeamB()) {
                          <div class="match-players-tab__dropdown-error">{{ availablePlayersErrorTeamB() }}</div>
                        } @else if (availablePlayersTeamB().length === 0) {
                          <div class="match-players-tab__dropdown-empty">No available players</div>
                        } @else {
                          @for (player of availablePlayersTeamB() | tuiFilterByInput; track player.id) {
                            <button
                              new
                              tuiOption
                              type="button"
                              [value]="player"
                              class="match-players-tab__dropdown-option">
                              {{ stringifyAvailablePlayer(player) }}
                            </button>
                          }
                        }
                      </tui-data-list>
                    </tui-textfield>
                  </div>
                  <div class="match-players-tab__add-actions">
                    <button
                      type="button"
                      tuiButton
                      appearance="primary"
                      size="s"
                      [disabled]="!selectedAvailablePlayerTeamB()"
                      (click)="addPlayerToMatch('B')">
                      Add to Match
                    </button>
                    <button
                      type="button"
                      tuiButton
                      appearance="flat"
                      size="s"
                      (click)="cancelAddPlayer('B')">
                      Cancel
                    </button>
                  </div>
                </div>
              }

              <!-- Starters Section -->
              @if (teamBStarters().length > 0) {
                <div class="match-players-tab__roster-section">
                  <div class="match-players-tab__section-header">
                    <tui-icon icon="@tui.star" class="match-players-tab__section-icon match-players-tab__section-icon--starter" />
                    <span class="match-players-tab__section-title">Starting Lineup</span>
                    <tui-badge appearance="positive" size="s" tuiStatus>
                      {{ teamBStarters().length }}
                    </tui-badge>
                  </div>
                  <div class="match-players-tab__players-list">
                    @for (player of teamBStarters(); track player.id) {
                        <div tuiSurface="neutral" class="match-players-tab__player-card">
                          <div class="match-players-tab__player-main">
                          <div class="match-players-tab__player-meta">
                            <div class="match-players-tab__player-number-badge">
                              {{ player.player_team_tournament?.player_number || '-' }}
                            </div>
                            @if (player.position) {
                              <span class="match-players-tab__position-text match-players-tab__position-text--under-number">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            <label class="match-players-tab__player-switch">
                              <input
                                type="checkbox"
                                tuiSwitch
                                [ngModel]="player.is_starting || false"
                                (ngModelChange)="togglePlayerStarting(player.id, $event)"
                                class="match-players-tab__switch"
                              />
                              <span class="match-players-tab__player-switch-label">
                                {{ player.is_starting ? 'Remove from starters' : 'Add to starters' }}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Bench Section -->
              @if (teamBBench().length > 0) {
                <div class="match-players-tab__roster-section">
                  <div class="match-players-tab__section-header">
                    <tui-icon icon="@tui.users" class="match-players-tab__section-icon" />
                    <span class="match-players-tab__section-title">Bench</span>
                    <tui-badge appearance="neutral" size="s">
                      {{ teamBBench().length }}
                    </tui-badge>
                  </div>
                  <div class="match-players-tab__players-list match-players-tab__players-list--bench">
                    @for (player of teamBBench(); track player.id) {
                      <div tuiSurface class="match-players-tab__player-card match-players-tab__player-card--bench">
                        <div class="match-players-tab__player-main">
                          <div class="match-players-tab__player-meta match-players-tab__player-meta--bench">
                            <div class="match-players-tab__player-number-badge match-players-tab__player-number-badge--bench">
                              {{ player.player_team_tournament?.player_number || '-' }}
                            </div>
                            @if (player.position) {
                              <span class="match-players-tab__position-text match-players-tab__position-text--under-number">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name match-players-tab__player-name--bench">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            <label class="match-players-tab__player-switch match-players-tab__player-switch--bench">
                              <input
                                type="checkbox"
                                tuiSwitch
                                [ngModel]="player.is_starting || false"
                                (ngModelChange)="togglePlayerStarting(player.id, $event)"
                                class="match-players-tab__switch"
                              />
                              <span class="match-players-tab__player-switch-label">
                                {{ player.is_starting ? 'Remove from starters' : 'Add to starters' }}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (teamBPlayers().length === 0) {
                <div class="match-players-tab__empty-roster">
                  <tui-icon icon="@tui.users" class="match-players-tab__empty-icon" />
                  <span>No players registered</span>
                </div>
              }
            </div>
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

  // Local state for players to support optimistic updates
  private localPlayersData = signal<PlayerMatchWithDetails[]>([]);

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

  // Sync local players when comprehensiveData input changes
  private syncEffect = effect(() => {
    const data = this.comprehensiveData();
    if (data) {
      this.localPlayersData.set([...data.players]);
    }
  });

  teamAPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return this.localPlayersData().filter(p => p.team_id === data.teams.team_a.id);
  });

  teamBPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return this.localPlayersData().filter(p => p.team_id === data.teams.team_b.id);
  });

  teamAStarters = computed(() =>
    this.teamAPlayers()
      .filter(p => p.is_starting)
      .sort((a, b) => this.compareByPlayerNumber(a, b))
  );
  teamABench = computed(() =>
    this.teamAPlayers()
      .filter(p => !p.is_starting)
      .sort((a, b) => this.compareByPlayerNumber(a, b))
  );
  teamBStarters = computed(() =>
    this.teamBPlayers()
      .filter(p => p.is_starting)
      .sort((a, b) => this.compareByPlayerNumber(a, b))
  );
  teamBBench = computed(() =>
    this.teamBPlayers()
      .filter(p => !p.is_starting)
      .sort((a, b) => this.compareByPlayerNumber(a, b))
  );

  getFullName(person: { first_name?: string | null; second_name?: string | null } | null | undefined): string {
    if (!person) return 'Unknown';
    const firstName = person.first_name || '';
    const secondName = person.second_name || '';
    const fullName = `${firstName} ${secondName}`.trim();
    return fullName || 'Unknown';
  }

  compareByPlayerNumber(a: any, b: any): number {
    const numA = a.player_team_tournament?.player_number || null;
    const numB = b.player_team_tournament?.player_number || null;

    if (numA === null && numB === null) return 0;
    if (numA === null) return 1;
    if (numB === null) return -1;

    const numberA = parseInt(numA.toString(), 10);
    const numberB = parseInt(numB.toString(), 10);

    return numberA - numberB;
  }

  stringifyAvailablePlayer(player: MatchAvailablePlayer | null): string {
    if (!player) return '';
    const number = player.player_team_tournament?.player_number;
    const firstName = capitalizeNameUtil(player.person?.first_name ?? null);
    const secondName = capitalizeNameUtil(player.person?.second_name ?? null);
    const name = `${secondName} ${firstName}`.trim();
    const position = player.position?.title ? ` — ${player.position.title}` : '';
    const numberLabel = number ? `#${number}` : '#-';
    return `${numberLabel} ${name}${position}`.trim();
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
    this.refreshMatchPlayers();
    this.loadAvailablePlayers(team);
  }

  private refreshMatchPlayers(): void {
    const matchId = this.getMatchId();
    if (!matchId) return;

    this.matchStore.getComprehensiveMatchData(matchId).subscribe({
      next: (data) => {
        this.localPlayersData.set([...data.players]);
      },
      error: () => {
        this.alerts.open('Failed to refresh match players', { label: 'Error', appearance: 'negative' }).subscribe();
      }
    });
  }

  private loadAvailablePlayers(team: 'A' | 'B'): void {
    const matchId = this.getMatchId();
    const teamId = this.getTeamId(team);
    if (!matchId || !teamId) return;

    this.setAvailablePlayersLoading(team, true);
    this.setAvailablePlayersError(team, null);

    this.matchStore.getAvailablePlayersForTeamInMatch(matchId, teamId).subscribe({
      next: (players) => {
        const sortedPlayers = [...players].sort((a, b) =>
          (a.person?.second_name || '').localeCompare(b.person?.second_name || '')
        );
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

    // Optimistic update: update local data immediately
    const currentPlayers = this.localPlayersData();
    const updatedPlayers = currentPlayers.map(p =>
      p.id === playerId ? { ...p, is_starting: isStarting } : p
    );
    this.localPlayersData.set(updatedPlayers);

    this.matchStore.updatePlayerMatch(playerId, data).subscribe({
      next: () => {
        this.alerts.open(
          isStarting ? 'Player marked as starter' : 'Player moved to bench',
          { label: 'Success', appearance: 'success' }
        ).subscribe();
      },
      error: () => {
        // Revert optimistic update on error
        this.localPlayersData.set(currentPlayers);
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
