import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';

@Component({
  selector: 'app-season-list',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './season-list.component.html',
  styleUrl: './season-list.component.less',
})
export class SeasonListComponent {
  private seasonStore = inject(SeasonStoreService);
  private router = inject(Router);

  seasons = this.seasonStore.seasons;
  loading = this.seasonStore.loading;
  error = this.seasonStore.error;

  navigateToCreate(): void {
    this.router.navigate(['/seasons/create']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/seasons', id]);
  }
}
