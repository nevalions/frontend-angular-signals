import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { RosterPositionGroupComponent } from '../roster-position-group/roster-position-group.component';

@Component({
  selector: 'app-roster-group-lb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RosterPositionGroupComponent],
  template: `
    <app-roster-position-group
      title="LB"
      [players]="players()"
      [teamColor]="teamColor()"
    />
  `,
})
export class RosterGroupLbComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
