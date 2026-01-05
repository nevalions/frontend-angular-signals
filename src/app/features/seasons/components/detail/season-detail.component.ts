import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-season-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './season-detail.component.html',
})
export class SeasonDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonStore = inject(SeasonStoreService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  seasonId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  season = computed(() => {
    const id = this.seasonId();
    if (!id) return null;
    return this.seasonStore.seasons().find((s: Season) => s.id === id) || null;
  });

  navigateBack(): void {
    this.router.navigate(['/seasons']);
  }

  navigateToEdit(): void {
    const id = this.seasonId();
    if (id) {
      this.router.navigate(['/seasons', id, 'edit']);
    }
  }

  navigateToTournaments(): void {
    const season = this.season();
    if (season) {
      this.router.navigate(['/seasons', 'year', season.year, 'tournaments']);
    }
  }

  navigateToTeams(): void {
    const season = this.season();
    if (season) {
      this.router.navigate(['/seasons', 'year', season.year, 'teams']);
    }
  }

  navigateToMatches(): void {
    const season = this.season();
    if (season) {
      this.router.navigate(['/seasons', 'year', season.year, 'matches']);
    }
  }

  deleteSeason(): void {
    const season = this.season();
    if (!season) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete season ${season.year}?`,
        content: 'This action cannot be undone!',
      },
      () => this.seasonStore.deleteSeason(season.id),
      () => this.navigateBack(),
      'Season'
    );
  }
}
