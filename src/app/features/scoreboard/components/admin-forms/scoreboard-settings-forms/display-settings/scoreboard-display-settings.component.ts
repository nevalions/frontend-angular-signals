import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiSwitch, TuiBlock } from '@taiga-ui/kit';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-scoreboard-display-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiSwitch, TuiBlock, TuiIcon, TuiTitle],
  templateUrl: './scoreboard-display-settings.component.html',
  styleUrl: './scoreboard-display-settings.component.less',
})
export class ScoreboardDisplaySettingsComponent {
  localShowQtr = input.required<boolean>();
  localShowTime = input.required<boolean>();
  localShowPlayClock = input.required<boolean>();
  localShowDownDistance = input.required<boolean>();
  localShowTournamentLogo = input.required<boolean>();
  localShowMainSponsor = input.required<boolean>();
  localShowSponsorLine = input.required<boolean>();

  toggleQtr = output<boolean>();
  toggleTime = output<boolean>();
  togglePlayClock = output<boolean>();
  toggleDownDistance = output<boolean>();
  toggleTournamentLogo = output<boolean>();
  toggleMainSponsor = output<boolean>();
  toggleSponsorLine = output<boolean>();
}
