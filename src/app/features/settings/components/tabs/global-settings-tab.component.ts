import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { GlobalSettingsGrouped, GlobalSetting, GlobalSettingUpdate } from '../../models/settings.model';
import { Season, SeasonCreate, SeasonUpdate } from '../../../seasons/models/season.model';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

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
    TuiIcon,
  ],
  templateUrl: './global-settings-tab.component.html',
  styleUrl: './global-settings-tab.component.less',
})
export class GlobalSettingsTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private seasonStore = inject(SeasonStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  settingsMap = signal<Record<string, GlobalSetting>>({});
  settingsLoading = signal(false);
  settingsError = signal<string | null>(null);

  seasons = this.seasonStore.seasons;
  seasonsLoading = this.seasonStore.loading;
  seasonYears = signal<number[]>([]);

  editingSeason = signal<Season | null>(null);
  seasonDialog = viewChild.required<TemplateRef<unknown>>('seasonDialog');

  seasonFormYear = signal<number>(new Date().getFullYear());
  seasonFormDescription = signal('');
  seasonFormIsCurrent = signal(false);

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

  openSeasonForm(season?: Season): void {
    if (season) {
      this.editingSeason.set(season);
      this.seasonFormYear.set(season.year);
      this.seasonFormDescription.set(season.description || '');
      this.seasonFormIsCurrent.set(season.iscurrent);
    } else {
      this.editingSeason.set(null);
      this.seasonFormYear.set(new Date().getFullYear());
      this.seasonFormDescription.set('');
      this.seasonFormIsCurrent.set(false);
    }

    this.dialogs
      .open(this.seasonDialog(), {
        label: season ? 'Edit Season' : 'Add New Season',
        size: 's',
        dismissible: true,
      })
      .subscribe({
        next: (data: unknown) => {
          if (data && typeof data === 'object' && 'year' in data) {
            const seasonData = data as SeasonCreate | SeasonUpdate;
            const editing = this.editingSeason();

            if (editing) {
              const updateData: SeasonUpdate = seasonData as SeasonUpdate;
              this.seasonStore.updateSeason(editing.id, updateData).subscribe({
                next: () => {
                  this.alerts.open('Season updated successfully', {
                    label: 'Success',
                    appearance: 'positive',
                    autoClose: 3000,
                  });
                },
                error: (err) => {
                  console.error('Failed to update season:', err);
                  this.alerts.open(`Failed to update season: ${err.message || 'Unknown error'}`, {
                    label: 'Error',
                    appearance: 'negative',
                    autoClose: 0,
                  });
                }
              });
            } else {
              this.seasonStore.createSeason(seasonData as SeasonCreate).subscribe({
                next: () => {
                  this.alerts.open('Season created successfully', {
                    label: 'Success',
                    appearance: 'positive',
                    autoClose: 3000,
                  });
                },
                error: (err) => {
                  console.error('Failed to create season:', err);
                  this.alerts.open(`Failed to create season: ${err.message || 'Unknown error'}`, {
                    label: 'Error',
                    appearance: 'negative',
                    autoClose: 0,
                  });
                }
              });
            }
          }
        },
        complete: () => {
          this.editingSeason.set(null);
          this.seasonFormYear.set(new Date().getFullYear());
          this.seasonFormDescription.set('');
          this.seasonFormIsCurrent.set(false);
        }
      });
  }

  deleteSeason(season: Season): void {
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete season ${season.year}?`,
        content: 'This action cannot be undone.',
      },
      () => this.seasonStore.deleteSeason(season.id),
      () => {},
      'Season'
    );
  }
}
