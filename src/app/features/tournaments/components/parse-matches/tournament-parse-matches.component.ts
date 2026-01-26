import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TuiDialogService, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { MatchStoreService } from '../../../matches/services/match-store.service';
import { Tournament } from '../../models/tournament.model';
import { Sport } from '../../../sports/models/sport.model';
import { Match } from '../../../matches/models/match.model';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-tournament-parse-matches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TuiButton,
    TuiIcon,
    EntityHeaderComponent
  ],
  templateUrl: './tournament-parse-matches.component.html',
  styleUrl: './tournament-parse-matches.component.less',
})
export class TournamentParseMatchesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
  private matchStore = inject(MatchStoreService);
  private readonly dialogs = inject(TuiDialogService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('sportId')))),
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
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  parsedMatches = signal<Match[]>([]);
  isParsing = signal(false);

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  season = computed(() => {
    const y = this.year();
    if (!y) return null;
    return this.seasonStore.seasonByYear().get(y) || null;
  });

  tournament = computed(() => {
    const id = this.tournamentId();
    if (!id) return null;
    return this.tournamentStore.tournaments().find((t: Tournament) => t.id === id) || null;
  });

  parseTournamentMatches(): void {
    const tournament = this.tournament();

    if (!tournament) {
      alert('Tournament not found. Please navigate from a tournament detail page.');
      return;
    }

    const eeslTournamentId = tournament.tournament_eesl_id;
    if (!eeslTournamentId) {
      alert('Tournament does not have an EESL ID. Cannot parse matches.');
      return;
    }

    console.log('Parsing EESL tournament matches:', { eeslTournamentId, tournamentId: tournament.id });

    this.isParsing.set(true);
    this.matchStore.parseEESLTournamentMatches(eeslTournamentId).subscribe({
      next: (matches: Match[]) => {
        this.parsedMatches.set(matches);
        const message = `Successfully parsed and created ${matches.length} matches from EESL tournament (EESL ID: ${eeslTournamentId})`;
        this.dialogs.open(message, {
          label: 'Success',
          size: 'm'
        }).subscribe({
          complete: () => this.navigateBack()
        });
        this.isParsing.set(false);
      },
      error: (err: unknown) => {
        console.error('Error parsing and creating EESL tournament matches:', err);
        alert('Failed to parse and create matches from EESL tournament. Please try again.');
        this.isParsing.set(false);
      }
    });
  }

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.year();
    const tournamentId = this.tournamentId();
    if (sportId && year && tournamentId) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', tournamentId]);
    }
  }
}
