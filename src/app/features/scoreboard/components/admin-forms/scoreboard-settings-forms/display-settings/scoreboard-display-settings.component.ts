import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiDataList, TuiIcon, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiChevron, TuiSelect, TuiSwitch, TuiBlock } from '@taiga-ui/kit';
import { LANGUAGE_OPTIONS, type ScoreboardLanguageCode } from '../../../../../../core/enums/scoreboard-language.enum';

@Component({
  selector: 'app-scoreboard-display-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiSwitch, TuiBlock, TuiIcon, TuiTitle, TuiTextfield, TuiSelect, TuiChevron, TuiDataList],
  templateUrl: './scoreboard-display-settings.component.html',
  styleUrl: './scoreboard-display-settings.component.less',
})
export class ScoreboardDisplaySettingsComponent {
  localShowQtr = input.required<boolean>();
  localShowTime = input.required<boolean>();
  localShowPlayClock = input.required<boolean>();
  localShowDownDistance = input.required<boolean>();

  localLanguageCode = input.required<ScoreboardLanguageCode>();

  toggleQtr = output<boolean>();
  toggleTime = output<boolean>();
  togglePlayClock = output<boolean>();
  toggleDownDistance = output<boolean>();

  languageChange = output<ScoreboardLanguageCode>();

  protected readonly languageOptions = LANGUAGE_OPTIONS;

  protected readonly languageContent = computed(() => {
    return this.languageStringify(this.localLanguageCode());
  });

  protected readonly languageStringify: TuiStringHandler<ScoreboardLanguageCode> = (code) => {
    return this.languageOptions.find((opt) => opt.code === code)?.label ?? '';
  };
}
