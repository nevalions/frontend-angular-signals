import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-match-stats-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="match-stats-tab__placeholder">
      Match Stats tab - Not yet implemented
    </div>
  `,
  styleUrl: './match-stats-tab.component.less',
})
export class MatchStatsTabComponent {}
