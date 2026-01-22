import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { RosterPositionGroupComponent } from '../roster-position-group/roster-position-group.component';

@Component({
  selector: 'app-roster-group-o-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RosterPositionGroupComponent],
  template: `
    <app-roster-position-group
      title="O-Line"
      [players]="players()"
      [teamColor]="teamColor()"
    />
  `,
})
export class RosterGroupOLineComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
