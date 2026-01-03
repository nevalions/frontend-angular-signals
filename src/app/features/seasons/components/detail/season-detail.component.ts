import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

@Component({
  selector: 'app-season-detail',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './season-detail.component.html',
  styleUrl: './season-detail.component.less',
})
export class SeasonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonStore = inject(SeasonStoreService);

  season: Season | null = null;
  seasonId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.seasonId = Number(idParam);
      this.season = this.seasonStore.seasons().find((s) => s.id === this.seasonId) || null;
    }
  }

  navigateBack(): void {
    this.router.navigate(['/seasons']);
  }

  navigateToEdit(): void {
    if (this.seasonId) {
      this.router.navigate(['/seasons', this.seasonId, 'edit']);
    }
  }

  navigateToTournaments(): void {
    if (this.season) {
      this.router.navigate(['/seasons', 'year', this.season.year, 'tournaments']);
    }
  }

  navigateToTeams(): void {
    if (this.season) {
      this.router.navigate(['/seasons', 'year', this.season.year, 'teams']);
    }
  }

  navigateToMatches(): void {
    if (this.season) {
      this.router.navigate(['/seasons', 'year', this.season.year, 'matches']);
    }
  }

  deleteSeason(): void {
    if (this.seasonId && confirm('Are you sure you want to delete this season?')) {
      this.seasonStore.deleteSeason(this.seasonId).subscribe(() => {
        this.navigateBack();
      });
    }
  }
}
