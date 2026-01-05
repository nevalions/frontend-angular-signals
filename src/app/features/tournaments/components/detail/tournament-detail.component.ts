import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { TuiConfirmService } from '@taiga-ui/kit';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.less',
})
export class TournamentDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private readonly dialogs = inject(TuiConfirmService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  year = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  tournamentId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  season = computed(() => {
    const y = this.year();
    if (!y) return null;
    return this.seasonStore.seasonByYear().get(y) || null;
  });

  tournament = computed(() => {
    const id = this.tournamentId();
    if (!id) return null;
    return this.tournamentStore.tournaments().find((t) => t.id === id) || null;
  });

  loading = this.tournamentStore.loading;

  navigateBack(): void {
    const sportId = this.sportId();
    if (sportId) {
      this.router.navigate(['/sports', sportId]);
    }
  }

  navigateToEdit(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id, 'edit']);
    }
  }

  deleteTournament(): void {
    const id = this.tournamentId();
    const tournament = this.tournament();
    if (!tournament) return;

    this.dialogs
      .withConfirm({
        data: {
          content: `Are you sure you want to delete tournament ${tournament.title}?`,
          yes: 'Delete',
          no: 'Cancel',
        },
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed && id) {
          this.tournamentStore.deleteTournament(id).subscribe(() => {
            this.navigateBack();
          });
        }
      });
  }
}
