import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FootballTeamStats } from '../../../../matches/models/match-stats.model';
import { fadeInOutAnimation } from '../../../animations';
import { WebSocketService } from '../../../../../core/services/websocket.service';

@Component({
  selector: 'app-team-match-lower-football-stats-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-match-lower-football-stats-display.component.html',
  styleUrl: './team-match-lower-football-stats-display.component.less',
  animations: [fadeInOutAnimation],
})
export class TeamMatchLowerFootballStatsDisplayComponent {
  private wsService = inject(WebSocketService);
  teamName = input<string>('');
  teamColor = input<string>('#1a1a1a');
  alignment = input<'home' | 'away'>('home');
  stats = input<FootballTeamStats | null>(null);

  private lastStatsUpdate = 0;
  protected isUpdating = signal(false);

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
