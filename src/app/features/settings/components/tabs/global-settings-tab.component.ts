import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiDataList } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { GlobalSettings } from '../../models/settings.model';
import { Season } from '../../../seasons/models/season.model';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';

@Component({
  selector: 'app-global-settings-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiButton,
    TuiDataList,
  ],
  templateUrl: './global-settings-tab.component.html',
  styleUrl: './global-settings-tab.component.less',
})
export class GlobalSettingsTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private seasonStore = inject(SeasonStoreService);
  private readonly alerts = inject(TuiAlertService);

  settings = signal<GlobalSettings | null>(null);
  settingsLoading = signal(false);
  settingsError = signal<string | null>(null);

  seasons = this.seasonStore.seasons;
  seasonYears = signal<number[]>([]);

  private loadSettings = effect(() => {
    this.loadGlobalSettings();
  });

  private updateSeasonYears = effect(() => {
    const seasons = this.seasons();
    this.seasonYears.set(seasons.map((s: Season) => s.year));
  });

  constructor() {
    this.seasonStore.reload();
  }

  loadGlobalSettings(): void {
    this.settingsLoading.set(true);
    this.settingsError.set(null);

    this.settingsStore.getGlobalSettings().subscribe({
      next: (data: GlobalSettings) => {
        this.settings.set(data);
        this.settingsLoading.set(false);
      },
      error: () => {
        this.settingsError.set('Failed to load settings');
        this.settingsLoading.set(false);
      }
    });
  }

  updateSetting(key: keyof GlobalSettings, value: GlobalSettings[keyof GlobalSettings]): void {
    const currentSettings = this.settings();
    if (!currentSettings) return;

    this.settingsStore.updateGlobalSetting(key, value).subscribe({
      next: (updatedSettings: GlobalSettings) => {
        this.settings.set(updatedSettings);
        this.alerts.open('Setting updated successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
      },
      error: () => {
        this.alerts.open('Failed to update setting', { label: 'Error', appearance: 'negative' });
      }
    });
  }
}
