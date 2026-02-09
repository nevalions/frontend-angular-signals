import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiDialogService, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { SportScoreboardPreset } from '../../models/sport-scoreboard-preset.model';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-sport-scoreboard-preset-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent, RouterLink, TuiBadge, TuiCardLarge, TuiCell, TuiLoader],
  templateUrl: './sport-scoreboard-preset-detail.component.html',
  styleUrl: './sport-scoreboard-preset-detail.component.less',
})
export class SportScoreboardPresetDetailComponent {
  private route = inject(ActivatedRoute);
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  presetId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  preset = computed(() => {
    const id = this.presetId();
    if (!id) return null;
    return this.presetStore.presets().find((p: SportScoreboardPreset) => p.id === id) || null;
  });

  loading = this.presetStore.loading;

  sportsResource = rxResource({
    params: computed(() => ({
      presetId: this.presetId(),
    })),
    stream: ({ params }) => {
      if (!params.presetId) {
        return of([]);
      }
      return this.presetStore.getSportsByPreset(params.presetId);
    },
  });

  sports = computed(() => {
    const value = this.sportsResource.value();
    if (!value || !Array.isArray(value)) return [];
    return value as Array<{ id: number; title: string }>;
  });
  sportsLoading = computed(() => this.sportsResource.isLoading());

  navigateBack(): void {
    this.navigationHelper.toSportScoreboardPresetList();
  }

  onEdit(): void {
    const id = this.presetId();
    if (id) {
      this.navigationHelper.toSportScoreboardPresetEdit(id);
    }
  }

  onDelete(): void {
    const preset = this.preset();
    const id = this.presetId();
    if (!preset || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete preset "${preset.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.presetStore.delete(id),
      () => this.navigateBack(),
      'Preset'
    );
  }
}
