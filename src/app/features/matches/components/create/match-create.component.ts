import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { MatchStoreService } from '../../services/match-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { MatchCreate } from '../../models/match.model';
import { Team } from '../../models/match.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-match-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron],
  templateUrl: './match-create.component.html',
  styleUrl: './match-create.component.less',
})
export class MatchCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private matchStore = inject(MatchStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private route = inject(ActivatedRoute);

  matchForm = this.fb.group({
    team_a_id: [null as number | null, [Validators.required]],
    team_b_id: [null as number | null, [Validators.required]],
    match_date: [null as string | null],
    week: [null as number | null],
    match_eesl_id: [null as number | null],
    main_sponsor_id: [null as number | null],
    sponsor_line_id: [null as number | null],
  });

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

  tournamentId = computed(() => {
    const id = this.route.snapshot.queryParamMap.get('tournamentId');
    return id ? Number(id) : null;
  });

  year = computed(() => {
    const year = this.route.snapshot.queryParamMap.get('year');
    return year ? Number(year) : null;
  });

  tournament = computed(() => {
    const tournamentId = this.tournamentId();
    return this.tournamentStore.tournaments().find((t) => t.id === tournamentId) || null;
  });

  teams = signal<Team[]>([]);

  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;

  private loadTeamsOnTournamentChange = effect(() => {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.tournamentStore.getTeamsByTournamentId(tournamentId).subscribe({
        next: (teams) => this.teams.set(teams),
      });
    }
  });

  onSubmit(): void {
    const tournamentId = this.tournamentId();
    if (this.matchForm.valid && tournamentId) {
      const formData = this.matchForm.value;
      const data: MatchCreate = {
        team_a_id: formData.team_a_id as number,
        team_b_id: formData.team_b_id as number,
        tournament_id: tournamentId,
        match_date: formData.match_date || null,
        week: formData.week || null,
        match_eesl_id: formData.match_eesl_id || null,
        main_sponsor_id: formData.main_sponsor_id || null,
        sponsor_line_id: formData.sponsor_line_id || null,
        isprivate: false,
      };

      withCreateAlert(
        this.alerts,
        () => this.matchStore.createMatch(data),
        () => this.onSuccess(),
        'Match'
      );
    }
  }

  cancel(): void {
    const sportId = this.sportId();
    const tournamentId = this.tournamentId();
    const year = this.year();
    if (sportId && tournamentId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId, 'matches');
    }
  }

  onSuccess(): void {
    this.cancel();
  }
}
