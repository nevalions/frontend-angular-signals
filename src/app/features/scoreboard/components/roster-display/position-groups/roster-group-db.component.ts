import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { RosterPositionGroupComponent } from '../roster-position-group/roster-position-group.component';

@Component({
  selector: 'app-roster-group-db',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RosterPositionGroupComponent],
  template: `
    <app-roster-position-group
      title="DB"
      [players]="players()"
      [teamColor]="teamColor()"
    />
  `,
})
export class RosterGroupDbComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
