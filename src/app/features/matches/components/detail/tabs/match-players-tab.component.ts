import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData, PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';
import { MatchStoreService } from '../../../services/match-store.service';
import { TuiAvatar, TuiBadge, TuiChip, TuiStatus, TuiSwitch } from '@taiga-ui/kit';
import { TuiAppearance, TuiIcon, TuiSurface, TuiTitle, TuiAlertService } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';
import { PlayerMatchUpdate } from '../../../models/player-match.model';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
                          <div class="match-players-tab__player-number-badge">
                            {{ player.player_team_tournament?.player_number || '-' }}
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            @if (player.position) {
                              <tui-chip size="xs" class="match-players-tab__position-chip">
                                {{ player.position.title }}
                              </tui-chip>
                            }
                          </div>
                          <input
                            type="checkbox"
                            [checked]="player.is_starting || false"
                            (change)="togglePlayerStarting(player.id, $event.target.checked)"
                            tuiSwitch
                          />
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
                          <div class="match-players-tab__player-number-badge match-players-tab__player-number-badge--bench">
                            {{ player.player_team_tournament?.player_number || '-' }}
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name match-players-tab__player-name--bench">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            @if (player.position) {
                              <span class="match-players-tab__position-text">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <label class="match-players-tab__player-toggle match-players-tab__player-toggle--bench">
                            <input
                              type="checkbox"
                              [checked]="player.is_starting || false"
                              (change)="togglePlayerStarting(player.id, $event.target.checked)"
                              tuiSwitch
                            />
                          </label>
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
                          <div class="match-players-tab__player-number-badge">
                            {{ player.player_team_tournament?.player_number || '-' }}
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            @if (player.position) {
                              <tui-chip size="xs" class="match-players-tab__position-chip">
                                {{ player.position.title }}
                              </tui-chip>
                            }
                          </div>
                          <input
                            type="checkbox"
                            [checked]="player.is_starting || false"
                            (change)="togglePlayerStarting(player.id, $event.target.checked)"
                            tuiSwitch
                          />
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
                          <div class="match-players-tab__player-number-badge match-players-tab__player-number-badge--bench">
                            {{ player.player_team_tournament?.player_number || '-' }}
                          </div>
                          <div class="match-players-tab__player-details">
                            <span class="match-players-tab__player-name match-players-tab__player-name--bench">
                              {{ getFullName(player.person).toUpperCase() }}
                            </span>
                            @if (player.position) {
                              <span class="match-players-tab__position-text">
                                {{ player.position.title }}
                              </span>
                            }
                          </div>
                          <label class="match-players-tab__player-toggle match-players-tab__player-toggle--bench">
                            <input
                              type="checkbox"
                              [checked]="player.is_starting || false"
                              (change)="togglePlayerStarting(player.id, $event.target.checked)"
                              tuiSwitch
                            />
                          </label>
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
