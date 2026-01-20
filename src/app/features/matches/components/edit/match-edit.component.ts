import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { MatchStoreService } from '../../services/match-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { MatchUpdate, MatchWithDetails, Team } from '../../models/match.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-match-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.less',
})
export class MatchEditComponent implements OnInit {
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

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  matchId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  year = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  tournamentId = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('tournamentId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  match = signal<MatchWithDetails | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  teams = signal<Team[]>([]);

  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;

  ngOnInit(): void {
    this.loadMatch();
  }

  loadMatch(): void {
    const matchId = this.matchId();
    if (!matchId) return;

    this.loading.set(true);
    this.error.set(null);

    this.matchStore.getMatchById(matchId).subscribe({
      next: (match) => {
        this.match.set(match);
        this.populateForm(match);
        this.loadTeams(match.tournament_id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load match');
        this.loading.set(false);
      }
    });
  }

  populateForm(match: MatchWithDetails): void {
    this.matchForm.patchValue({
      team_a_id: match.team_a_id,
      team_b_id: match.team_b_id,
      match_date: match.match_date,
      week: match.week,
      match_eesl_id: match.match_eesl_id,
      main_sponsor_id: match.main_sponsor_id,
      sponsor_line_id: match.sponsor_line_id,
    });
  }

  loadTeams(tournamentId: number | null | undefined): void {
    if (tournamentId) {
      this.tournamentStore.getTeamsByTournamentId(tournamentId).subscribe({
        next: (teams) => this.teams.set(teams),
      });
    }
  }

  onSubmit(): void {
    const matchId = this.matchId();
    if (this.matchForm.valid && matchId) {
      const formData = this.matchForm.value;
      const data: MatchUpdate = {
        team_a_id: formData.team_a_id ?? undefined,
        team_b_id: formData.team_b_id ?? undefined,
        match_date: formData.match_date ?? undefined,
        week: formData.week ?? undefined,
        match_eesl_id: formData.match_eesl_id ?? undefined,
        main_sponsor_id: formData.main_sponsor_id ?? undefined,
        sponsor_line_id: formData.sponsor_line_id ?? undefined,
      };

      withUpdateAlert(
        this.alerts,
        () => this.matchStore.updateMatch(matchId, data),
        () => this.onSuccess(),
        'Match'
      );
    }
  }

  cancel(): void {
    const sportId = this.sportId();
    const matchId = this.matchId();
    if (sportId && matchId) {
      this.navigationHelper.toMatchDetail(sportId, matchId, this.year() ?? undefined, this.tournamentId() ?? undefined);
    }
  }

  onSuccess(): void {
    this.cancel();
  }
}
