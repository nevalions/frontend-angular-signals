import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiSwitch, TuiSlider, TuiBlock, TuiInputColor } from '@taiga-ui/kit';
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';

@Component({
  selector: 'app-scoreboard-team-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    TuiSwitch,
    TuiSlider,
    TuiBlock,
    TuiInputColor,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiTextfield,
  ],
  templateUrl: './scoreboard-team-settings.component.html',
  styleUrl: './scoreboard-team-settings.component.less',
})
export class ScoreboardTeamSettingsComponent {
  teamAColor = input.required<string>();
  teamBColor = input.required<string>();
  teamAGameTitle = input.required<string>();
  teamBGameTitle = input.required<string>();
  teamAGameLogo = input.required<string>();
  teamBGameLogo = input.required<string>();
  logoAScale = input.required<number>();
  logoBScale = input.required<number>();

  localUseTeamAColor = input.required<boolean>();
  localUseTeamBColor = input.required<boolean>();
  localUseTeamATitle = input.required<boolean>();
  localUseTeamBTitle = input.required<boolean>();
  localUseTeamALogo = input.required<boolean>();
  localUseTeamBLogo = input.required<boolean>();
  uploadingTeamALogo = input.required<boolean>();
  uploadingTeamBLogo = input.required<boolean>();

  teamAColorChange = output<string>();
  teamBColorChange = output<string>();
  teamAGameTitleChange = output<string>();
  teamBGameTitleChange = output<string>();
  toggleUseTeamAColor = output<boolean>();
  toggleUseTeamBColor = output<boolean>();
  toggleUseTeamATitle = output<boolean>();
  toggleUseTeamBTitle = output<boolean>();
  toggleUseTeamALogo = output<boolean>();
  toggleUseTeamBLogo = output<boolean>();
  teamALogoFileSelected = output<Event>();
  teamBLogoFileSelected = output<Event>();
  removeTeamALogo = output<void>();
  removeTeamBLogo = output<void>();
  logoAScaleChange = output<number>();
  logoBScaleChange = output<number>();
}
