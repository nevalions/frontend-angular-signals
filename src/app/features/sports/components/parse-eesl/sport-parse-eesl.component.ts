import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { TournamentCreate } from '../../../tournaments/models/tournament.model';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';

@Component({
  selector: 'app-sport-parse-eesl',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './sport-parse-eesl.component.html',
  styleUrl: './sport-parse-eesl.component.less',
})
export class SportParseEeslComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);

  eeslSeasonId = signal<number | null>(null);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('sportId')))),
    { initialValue: null }
  );

  parsedTournaments = signal<TournamentCreate[]>([]);
  selectedTournamentIds = signal<Set<number>>(new Set());
  isParsing = signal(false);
  isSaving = signal(false);
  showSuccessDialog = signal(false);
  successMessage = signal('');

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  currentSeason = computed(() => {
    const seasons = this.seasonStore.seasons();
    const currentSeasonId = seasons.find(s => s.iscurrent)?.id;
    return seasons.find(s => s.id === currentSeasonId) || null;
  });

  parseSeason(): void {
    const eeslId = this.eeslSeasonId();
    if (!eeslId) {
      alert('Please enter an EESL Season ID');
      return;
    }

    this.isParsing.set(true);
    this.tournamentStore.parseEESLSeason(eeslId).subscribe({
      next: (tournaments) => {
        this.parsedTournaments.set(tournaments);
        const validIds = tournaments.map(t => t.tournament_eesl_id).filter((id): id is number => id !== null && id !== undefined && id > 0);
        this.selectedTournamentIds.set(new Set(validIds));
        this.isParsing.set(false);
      },
      error: (err) => {
        console.error('Error parsing EESL season:', err);
        alert('Failed to parse EESL season. Please check the ID and try again.');
        this.isParsing.set(false);
      }
    });
  }

  saveTournaments(): void {
    const eeslId = this.eeslSeasonId();
    const sportId = this.sportId();
    const season = this.currentSeason();

    if (!eeslId || !sportId || !season) {
      alert('Missing required data');
      return;
    }

    const tournamentsToSave = this.parsedTournaments().filter(t =>
      t.tournament_eesl_id && t.tournament_eesl_id > 0 && this.selectedTournamentIds().has(t.tournament_eesl_id)
    );

    if (tournamentsToSave.length === 0) {
      alert('No tournaments selected to save');
      return;
    }

    if (!confirm(`Save ${tournamentsToSave.length} tournaments?`)) {
      return;
    }

    this.isSaving.set(true);
    this.tournamentStore.parseAndCreateEESLSeason(eeslId, season.id, sportId).subscribe({
      next: (tournaments) => {
        this.successMessage.set(`Successfully created ${tournaments.length} tournaments`);
        this.showSuccessDialog.set(true);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving tournaments:', err);
        alert('Failed to save tournaments');
        this.isSaving.set(false);
      }
    });
  }

  closeSuccessDialog(): void {
    this.showSuccessDialog.set(false);
    this.navigateBack();
  }

  toggleTournamentSelection(eeslId: number | null | undefined): void {
    if (!eeslId) return;

    const current = this.selectedTournamentIds();
    const updated = new Set(current);

    if (updated.has(eeslId)) {
      updated.delete(eeslId);
    } else {
      updated.add(eeslId);
    }

    this.selectedTournamentIds.set(updated);
  }

  navigateBack(): void {
    const sportId = this.sportId();
    if (sportId) {
      this.router.navigate(['/sports', sportId]);
    } else {
      this.router.navigate(['/sports']);
    }
  }
}
