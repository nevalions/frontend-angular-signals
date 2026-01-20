import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { TuiAvatar, TuiBadge } from '@taiga-ui/kit';
import { TuiTitle } from '@taiga-ui/core';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TuiAvatar, TuiBadge, TuiTitle],
  template: `
    @if (comprehensiveData()) {
      <div class="match-players-tab">
        <div class="match-players-tab__team-section">
          <h3 tuiTitle class="match-players-tab__team-title">
            {{ comprehensiveData()!.teams.team_a.title }}
          </h3>
          <div class="match-players-tab__players-grid">
            @for (player of teamAPlayers(); track player.id) {
              <div class="match-players-tab__player-card">
                <div class="match-players-tab__player-header">
                  <tui-avatar
                    class="match-players-tab__player-avatar"
                    [src]="player.person?.photo_url ? playerPhotoUrl(player.person.photo_url) : null"
                    [size]="'l'"
                  >
                    {{ getInitials(player.person?.full_name) }}
                  </tui-avatar>
                  <div class="match-players-tab__player-badges">
                    @if (player.is_starting) {
                      <tui-badge appearance="primary" size="s" class="match-players-tab__starting-badge">
                        Starting
                      </tui-badge>
                    }
                  </div>
                </div>
                <div class="match-players-tab__player-info">
                  <div class="match-players-tab__player-number">
                    #{{ player.player_team_tournament?.player_number || '-' }}
                  </div>
                  <h4 class="match-players-tab__player-name">
                    {{ player.person?.full_name || 'Unknown' }}
                  </h4>
                  @if (player.position) {
                    <tui-badge appearance="neutral" size="s" class="match-players-tab__position-badge">
                      {{ player.position.title }}
                    </tui-badge>
                  }
                </div>
              </div>
            } @empty {
              <div class="match-players-tab__empty">No players available</div>
            }
          </div>
        </div>

        <div class="match-players-tab__team-section">
          <h3 tuiTitle class="match-players-tab__team-title">
            {{ comprehensiveData()!.teams.team_b.title }}
          </h3>
          <div class="match-players-tab__players-grid">
            @for (player of teamBPlayers(); track player.id) {
              <div class="match-players-tab__player-card">
                <div class="match-players-tab__player-header">
                  <tui-avatar
                    class="match-players-tab__player-avatar"
                    [src]="player.person?.photo_url ? playerPhotoUrl(player.person.photo_url) : null"
                    [size]="'l'"
                  >
                    {{ getInitials(player.person?.full_name) }}
                  </tui-avatar>
                  <div class="match-players-tab__player-badges">
                    @if (player.is_starting) {
                      <tui-badge appearance="primary" size="s" class="match-players-tab__starting-badge">
                        Starting
                      </tui-badge>
                    }
                  </div>
                </div>
                <div class="match-players-tab__player-info">
                  <div class="match-players-tab__player-number">
                    #{{ player.player_team_tournament?.player_number || '-' }}
                  </div>
                  <h4 class="match-players-tab__player-name">
                    {{ player.person?.full_name || 'Unknown' }}
                  </h4>
                  @if (player.position) {
                    <tui-badge appearance="neutral" size="s" class="match-players-tab__position-badge">
                      {{ player.position.title }}
                    </tui-badge>
                  }
                </div>
              </div>
            } @empty {
              <div class="match-players-tab__empty">No players available</div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="match-players-tab__loading">Loading players...</div>
    }
  `,
  styleUrl: './match-players-tab.component.less',
})
export class MatchPlayersTabComponent {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);

  teamAPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return data.players.filter(p => p.team_id === data.teams.team_a.id);
  });

  teamBPlayers = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return data.players.filter(p => p.team_id === data.teams.team_b.id);
  });

  playerPhotoUrl(photo: string): string {
    return buildStaticUrlUtil(photo);
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
