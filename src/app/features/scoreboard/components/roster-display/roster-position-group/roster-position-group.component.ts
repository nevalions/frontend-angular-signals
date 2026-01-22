import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { listItemAnimation, staggeredListAnimation } from '../../../animations';
import { PlayerCardRosterComponent } from '../player-card-roster/player-card-roster.component';

@Component({
  selector: 'app-roster-position-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerCardRosterComponent],
  templateUrl: './roster-position-group.component.html',
  styleUrl: './roster-position-group.component.less',
  animations: [staggeredListAnimation, listItemAnimation],
})
export class RosterPositionGroupComponent {
  title = input<string>('');
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
