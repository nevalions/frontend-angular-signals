import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './sport-detail.component.html',
  styleUrl: './sport-detail.component.less',
})
export class SportDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  navigateBack(): void {
    this.router.navigate(['/sports']);
  }

  navigateToTournaments(seasonYear: number): void {
    this.router.navigate(['/seasons', 'year', seasonYear, 'tournaments']);
  }

  navigateToSportTournaments(): void {
    const id = this.sportId();
    if (id) {
      this.sportStore.getTournamentsBySport(id).subscribe(() => {
      });
    }
  }
}
