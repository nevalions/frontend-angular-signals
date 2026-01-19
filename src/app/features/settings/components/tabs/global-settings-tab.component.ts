import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { GlobalSettingsGrouped, GlobalSetting, GlobalSettingUpdate } from '../../models/settings.model';
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
    TuiSelect,
  ],
  templateUrl: './global-settings-tab.component.html',
  styleUrl: './global-settings-tab.component.less',
})
export class GlobalSettingsTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private seasonStore = inject(SeasonStoreService);
  private readonly alerts = inject(TuiAlertService);

  settingsMap = signal<Record<string, GlobalSetting>>({});
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

    this.settingsStore.getGlobalSettingsGrouped().subscribe({
      next: (data: GlobalSettingsGrouped) => {
        const map: Record<string, GlobalSetting> = {};
        Object.values(data).forEach((settings) => {
          settings.forEach((setting) => {
            map[setting.key] = setting;
          });
        });
        this.settingsMap.set(map);
        this.settingsLoading.set(false);
      },
      error: () => {
        this.settingsError.set('Failed to load settings');
        this.settingsLoading.set(false);
      }
    });
  }

  getSettingValue(key: string): string {
    const setting = this.settingsMap()[key];
    return setting?.value || '';
  }

  updateSetting(key: string, value: string | number | boolean): void {
    const currentSettings = this.settingsMap()[key];
    if (!currentSettings) return;

    const updateData: GlobalSettingUpdate = {
      value: String(value),
    };

    this.settingsStore.updateGlobalSetting(currentSettings.id, updateData).subscribe({
      next: () => {
        this.loadGlobalSettings();
        this.alerts.open('Setting updated successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
      },
      error: () => {
        this.alerts.open('Failed to update setting', { label: 'Error', appearance: 'negative' });
      }
    });
  }

  onCheckboxChange(key: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.updateSetting(key, checkbox.checked);
  }
}
