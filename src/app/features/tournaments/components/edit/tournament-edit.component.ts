import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentUpdate } from '../../models/tournament.model';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private fb = inject(FormBuilder);

  tournamentForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  sportId = this.route.snapshot.paramMap.get('sportId') || '';
  year = this.route.snapshot.paramMap.get('year') || '';
  tournamentId = this.route.snapshot.paramMap.get('id') || '';

  sport = this.sportStore.sports().find((s) => s.id === Number(this.sportId)) || null;
  season = this.seasonStore.seasonByYear().get(Number(this.year)) || null;
  tournament = this.tournamentStore.tournaments().find((t) => t.id === Number(this.tournamentId)) || null;
  loading = this.tournamentStore.loading;

  ngOnInit(): void {
    if (this.tournament) {
      this.tournamentForm.patchValue({
        title: this.tournament.title,
        description: this.tournament.description || '',
      });
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid && this.tournamentId && this.tournament) {
      const formData = this.tournamentForm.value;
      const updateData: Partial<TournamentUpdate> = {};

      if (formData.title !== this.tournament.title) {
        updateData.title = formData.title as string;
      }

      const newDescription = formData.description || null;
      if (newDescription !== this.tournament.description) {
        updateData.description = newDescription;
      }

      if (Object.keys(updateData).length > 0) {
        this.tournamentStore.updateTournament(Number(this.tournamentId), updateData).subscribe(() => {
          this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
        });
      } else {
        this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
      }
    }
  }

  cancel(): void {
    this.navigationHelper.toTournamentsList(this.sportId, this.year);
  }
}
