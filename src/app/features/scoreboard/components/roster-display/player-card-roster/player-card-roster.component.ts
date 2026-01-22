import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';

@Component({
  selector: 'app-player-card-roster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-card-roster.component.html',
  styleUrl: './player-card-roster.component.less',
})
export class PlayerCardRosterComponent {
  player = input<PlayerMatchWithDetails | null>(null);
  teamColor = input<string>('#1a1a1a');

  protected readonly playerNumber = computed(() => {
    const player = this.player();
    return player?.match_number || player?.player_team_tournament?.player_number || null;
  });

  protected readonly playerName = computed(() => {
    const player = this.player();
    if (player?.person) {
      return `${player.person.first_name} ${player.person.second_name}`.trim();
    }

    return player ? `Player ${player.id}` : '';
  });

  protected readonly playerPosition = computed(() => this.player()?.position?.title ?? '');
}
