import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-match-events-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="match-events-tab__placeholder">
      Match Events tab - Not yet implemented
    </div>
  `,
  styleUrl: './match-events-tab.component.less',
})
export class MatchEventsTabComponent {}
