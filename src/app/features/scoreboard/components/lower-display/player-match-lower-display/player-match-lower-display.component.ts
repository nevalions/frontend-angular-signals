import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { buildStaticUrl } from '../../../../../core/config/api.constants';
import { fadeInOutAnimation } from '../../../animations';

@Component({
  selector: 'app-player-match-lower-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './player-match-lower-display.component.html',
  styleUrl: './player-match-lower-display.component.less',
  animations: [fadeInOutAnimation],
})
export class PlayerMatchLowerDisplayComponent {
  player = input<PlayerMatchWithDetails | null>(null);
  teamName = input<string>('');
  teamColor = input<string>('#1a1a1a');
  alignment = input<'home' | 'away'>('home');

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

  protected readonly playerPosition = computed(() => this.player()?.position?.title?.toUpperCase() ?? '');

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
}
