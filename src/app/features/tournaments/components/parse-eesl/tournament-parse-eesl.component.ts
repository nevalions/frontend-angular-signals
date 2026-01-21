import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TuiDialogService, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { Tournament } from '../../models/tournament.model';
import { Sport } from '../../../sports/models/sport.model';
import { Team } from '../../../teams/models/team.model';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-tournament-parse-eesl',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TuiButton,
    TuiIcon,
    EntityHeaderComponent
  ],
  templateUrl: './tournament-parse-eesl.component.html',
  styleUrl: './tournament-parse-eesl.component.less',
})
export class TournamentParseEeslComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
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

  parsedTeams = signal<Team[]>([]);
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

  parseTournamentTeams(): void {
    const tournament = this.tournament();

    if (!tournament) {
      alert('Tournament not found. Please navigate from a tournament detail page.');
      return;
    }

    const eeslTournamentId = tournament.tournament_eesl_id;
    if (!eeslTournamentId) {
      alert('Tournament does not have an EESL ID. Cannot parse teams.');
      return;
    }

    console.log('Parsing EESL tournament teams:', { eeslTournamentId, tournamentId: tournament.id });

    this.isParsing.set(true);
    this.tournamentStore.parseEESLTournamentTeams(eeslTournamentId).subscribe({
      next: (teams: Team[]) => {
        this.parsedTeams.set(teams);
        const message = `Successfully parsed and created ${teams.length} teams from EESL tournament (EESL ID: ${eeslTournamentId})`;
        this.dialogs.open(message, {
          label: 'Success',
          size: 'm'
        }).subscribe({
          complete: () => this.navigateBack()
        });
        this.isParsing.set(false);
      },
      error: (err: unknown) => {
        console.error('Error parsing and creating EESL tournament teams:', err);
        alert('Failed to parse and create teams from EESL tournament. Please try again.');
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
