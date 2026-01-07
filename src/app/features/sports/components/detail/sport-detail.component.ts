import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, UpperCasePipe, TuiTextfield, TuiChevron, TuiSelect, TuiDataList],
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
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  activeTab = signal('tournaments');

  selectedSeasonYear = signal<number | null>(null);

  navigateBack(): void {
    this.router.navigate(['/sports']);
  }

  navigateToTournaments(seasonYear: number): void {
    const id = this.sportId();
    if (id) {
      this.router.navigate(['/sports', id, 'seasons', seasonYear, 'tournaments']);
    }
  }

  onSeasonChange(year: number): void {
    this.navigateToTournaments(year);
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }
}
