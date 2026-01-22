import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { RosterPositionGroupComponent } from '../roster-position-group/roster-position-group.component';

@Component({
  selector: 'app-roster-group-qb-wr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RosterPositionGroupComponent],
  template: `
    <app-roster-position-group
      title="QB/WR/TE"
      [players]="players()"
      [teamColor]="teamColor()"
    />
  `,
})
export class RosterGroupQbWrComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  teamColor = input<string>('#1a1a1a');
}
