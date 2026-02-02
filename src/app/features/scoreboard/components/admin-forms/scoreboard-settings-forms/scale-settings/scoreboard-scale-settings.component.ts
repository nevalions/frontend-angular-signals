import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiSlider } from '@taiga-ui/kit';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-scoreboard-scale-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TuiSlider, TuiIcon],
  templateUrl: './scoreboard-scale-settings.component.html',
  styleUrl: './scoreboard-scale-settings.component.less',
})
export class ScoreboardScaleSettingsComponent {
  tournamentLogoScale = input.required<number>();
  mainSponsorScale = input.required<number>();

  tournamentLogoScaleChange = output<number>();
  mainSponsorScaleChange = output<number>();
}
