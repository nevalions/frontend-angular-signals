import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-match-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="match-players-tab__placeholder">
      Match Players tab - Not yet implemented
    </div>
  `,
  styleUrl: './match-players-tab.component.less',
})
export class MatchPlayersTabComponent {}
