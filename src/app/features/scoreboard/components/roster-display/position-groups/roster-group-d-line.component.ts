import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { RosterPositionGroupComponent } from '../roster-position-group/roster-position-group.component';

@Component({
  selector: 'app-roster-group-d-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RosterPositionGroupComponent],
  template: `
    <app-roster-position-group
      title="D-Line"
      [players]="players()"
      [teamColor]="teamColor()"
    />
  `,
})
export class RosterGroupDLineComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
