import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBlock, TuiSlider, TuiSwitch } from '@taiga-ui/kit';

@Component({
  selector: 'app-scoreboard-sponsor-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TuiBlock, TuiIcon, TuiSlider, TuiSwitch, TuiTitle],
  templateUrl: './scoreboard-sponsor-settings.component.html',
  styleUrl: './scoreboard-sponsor-settings.component.less',
})
export class ScoreboardSponsorSettingsComponent {
  localShowTournamentLogo = input.required<boolean>();
  localShowMainSponsor = input.required<boolean>();
  localShowSponsorLine = input.required<boolean>();
  localUseMatchSponsors = input.required<boolean>();

  tournamentLogoScale = input.required<number>();
  mainSponsorScale = input.required<number>();

  toggleTournamentLogo = output<boolean>();
  toggleMainSponsor = output<boolean>();
  toggleSponsorLine = output<boolean>();
  toggleUseMatchSponsors = output<boolean>();
  tournamentLogoScaleChange = output<number>();
  mainSponsorScaleChange = output<number>();
}
