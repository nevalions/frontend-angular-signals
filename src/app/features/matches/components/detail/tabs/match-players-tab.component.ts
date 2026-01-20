import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (comprehensiveData()) {
      <div class="match-players-tab">
        <div class="match-players-tab__team">
          <h3 class="match-players-tab__team-title">{{ comprehensiveData()!.teams.team_a.title }}</h3>
          <div class="match-players-tab__players-list">
            @for (player of teamAPlayers(); track player.id) {
              <div class="match-players-tab__player">
                @if (player.person?.photo_url; as photo) {
                  <img [src]="playerPhotoUrl(photo)" [alt]="player.person?.full_name || 'Unknown'" class="match-players-tab__player-photo" />
                }
                <div class="match-players-tab__player-info">
                  <span class="match-players-tab__player-number">{{ player.player_team_tournament?.player_number || '-' }}</span>
                  <span class="match-players-tab__player-name">{{ player.person?.full_name || 'Unknown' }}</span>
                  @if (player.position) {
                    <span class="match-players-tab__player-position">{{ player.position.title }}</span>
                  }
                  @if (player.is_starting) {
                    <span class="match-players-tab__player-starting">Starting</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="match-players-tab__empty">No players</div>
            }
          </div>
        </div>

        <div class="match-players-tab__team">
          <h3 class="match-players-tab__team-title">{{ comprehensiveData()!.teams.team_b.title }}</h3>
          <div class="match-players-tab__players-list">
            @for (player of teamBPlayers(); track player.id) {
              <div class="match-players-tab__player">
                @if (player.person?.photo_url; as photo) {
                  <img [src]="playerPhotoUrl(photo)" [alt]="player.person?.full_name || 'Unknown'" class="match-players-tab__player-photo" />
                }
                <div class="match-players-tab__player-info">
                  <span class="match-players-tab__player-number">{{ player.player_team_tournament?.player_number || '-' }}</span>
                  <span class="match-players-tab__player-name">{{ player.person?.full_name || 'Unknown' }}</span>
                  @if (player.position) {
                    <span class="match-players-tab__player-position">{{ player.position.title }}</span>
                  }
                  @if (player.is_starting) {
                    <span class="match-players-tab__player-starting">Starting</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="match-players-tab__empty">No players</div>
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
}
