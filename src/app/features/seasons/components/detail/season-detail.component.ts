import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

@Component({
  selector: 'app-season-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './season-detail.component.html',
  styleUrl: './season-detail.component.less',
})
export class SeasonDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonStore = inject(SeasonStoreService);

  seasonId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  season = computed(() => {
    const id = this.seasonId();
    if (!id) return null;
    return this.seasonStore.seasons().find((s) => s.id === id) || null;
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
    const id = this.seasonId();
    if (id && confirm('Are you sure you want to delete this season?')) {
      this.seasonStore.deleteSeason(id).subscribe(() => {
        this.navigateBack();
      });
    }
  }
}
