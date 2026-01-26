import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { FootballQBStats } from '../../../../matches/models/match-stats.model';
import { buildStaticUrl } from '../../../../../core/config/api.constants';
import { fadeInOutAnimation } from '../../../animations';
import { WebSocketService } from '../../../../../core/services/websocket.service';

@Component({
  selector: 'app-football-qb-lower-stats-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './football-qb-lower-stats-display.component.html',
  styleUrl: './football-qb-lower-stats-display.component.less',
  animations: [fadeInOutAnimation],
})
export class FootballQbLowerStatsDisplayComponent {
  private wsService = inject(WebSocketService);
  player = input<PlayerMatchWithDetails | null>(null);
  teamName = input<string>('');
  teamColor = input<string>('#1a1a1a');
  alignment = input<'home' | 'away'>('home');
  stats = input<FootballQBStats | null>(null);

  private lastStatsUpdate = 0;
  protected isUpdating = signal(false);

  protected readonly playerNumber = computed(() => {
    const player = this.player();
    return player?.match_number || player?.player_team_tournament?.player_number || '';
  });

  protected readonly playerName = computed(() => {
    const player = this.player();
    if (player?.person) {
      return `${player.person.first_name} ${player.person.second_name}`.trim().toUpperCase();
    }

    return player ? `PLAYER ${player.id}` : '';
  });

  protected readonly playerPosition = computed(() => this.player()?.position?.title?.toUpperCase() ?? 'QB');

  protected readonly photoUrl = computed(() => {
    const photo = this.player()?.person?.photo_url;
    return photo ? buildStaticUrl(photo) : '';
  });

  protected readonly initials = computed(() => {
    const player = this.player();
    if (!player?.person) return '';
    const first = player.person.first_name?.charAt(0) ?? '';
    const last = player.person.second_name?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  });

  protected formatStat(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '--';
    }
    return value.toString();
  }

  private updateEffect = effect(() => {
    const updateTime = this.wsService.lastStatsUpdate();
    if (updateTime && updateTime > this.lastStatsUpdate) {
      this.lastStatsUpdate = updateTime;

      this.isUpdating.set(true);
      setTimeout(() => this.isUpdating.set(false), 500);
    }
  });
}
