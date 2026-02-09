import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-sport-scoreboard-preset-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiButton, TuiCardLarge, TuiCell, TuiLoader],
  templateUrl: './sport-scoreboard-preset-list.component.html',
  styleUrl: './sport-scoreboard-preset-list.component.less',
})
export class SportScoreboardPresetListComponent {
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);

  presets = this.presetStore.presets;
  loading = this.presetStore.loading;
  error = this.presetStore.error;

  navigateToCreate(): void {
    this.navigationHelper.toSportScoreboardPresetCreate();
  }
}
