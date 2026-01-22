import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FootballTeamStats } from '../../../../matches/models/match-stats.model';
import { fadeInOutAnimation } from '../../../animations';

@Component({
  selector: 'app-team-match-lower-football-stats-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-match-lower-football-stats-display.component.html',
  styleUrl: './team-match-lower-football-stats-display.component.less',
  animations: [fadeInOutAnimation],
})
export class TeamMatchLowerFootballStatsDisplayComponent {
  teamName = input<string>('');
  teamColor = input<string>('#1a1a1a');
  alignment = input<'home' | 'away'>('home');
  stats = input<FootballTeamStats | null>(null);

  protected formatStat(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '--';
    }
    return value.toString();
  }
}
