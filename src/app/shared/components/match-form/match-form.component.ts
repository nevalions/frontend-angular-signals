import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { MatchCreate, MatchUpdate, MatchWithDetails, Team } from '../../../features/matches/models/match.model';

export type MatchFormMode = 'create' | 'edit';

export interface MatchFormInputs {
  mode: MatchFormMode;
  tournamentId: number | null;
  teams: Team[];
  sponsors: { id: number; title: string | null | undefined }[];
  sponsorLines: { id: number; title: string | null | undefined }[];
  match?: MatchWithDetails | null;
}

export interface MatchFormOutputs {
  submitted: (data: MatchCreate | MatchUpdate) => void;
  cancelled: () => void;
}

@Component({
  selector: 'app-match-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.less',
})
export class MatchFormComponent {
  private fb = inject(FormBuilder);

  mode = input.required<MatchFormMode>();
  tournamentId = input.required<number | null>();
  teams = input.required<Team[]>();
  sponsors = input.required<{ id: number; title?: string | null }[]>();
  sponsorLines = input.required<{ id: number; title?: string | null }[]>();
  match = input<MatchWithDetails | null>(null);
  loading = input(false);

  submitted = output<MatchCreate | MatchUpdate>();
  cancelled = output<void>();

  matchForm = this.fb.group({
    team_a_id: [null as number | null, [Validators.required]],
    team_b_id: [null as number | null, [Validators.required]],
    match_date: [null as string | null],
    week: [null as number | null],
    match_eesl_id: [null as number | null],
    main_sponsor_id: [null as number | null],
    sponsor_line_id: [null as number | null],
  });

  title = computed(() => {
    return this.mode() === 'create' ? 'Create New Match' : 'Edit Match';
  });

  contextText = computed(() => {
    const m = this.match();
    if (this.mode() === 'edit' && m) {
      return `${m.team_a?.title || 'Team A'} vs ${m.team_b?.title || 'Team B'}`;
    }
    return null;
  });

  submitButtonText = computed(() => {
    return this.mode() === 'create' ? 'Create Match' : 'Save Changes';
  });

  private populateFormOnMatchChange = effect(() => {
    const match = this.match();
    if (match && this.mode() === 'edit') {
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
  });

  getTeamById(id: number | null | undefined): Team | null {
    if (!id) return null;
    return this.teams().find((team) => team.id === id) || null;
  }

  formatTeamTitle(title: string | null | undefined): string {
    return title?.toUpperCase() || '';
  }

  teamStringify: TuiStringHandler<number> = (id) => {
    const team = this.getTeamById(id);
    return team ? this.formatTeamTitle(team.title) : '';
  };

  sponsorStringify: TuiStringHandler<number> = (id) => {
    const sponsor = this.sponsors().find((s) => s.id === id);
    return sponsor ? this.formatTeamTitle(sponsor.title) : '';
  };

  sponsorLineStringify: TuiStringHandler<number> = (id) => {
    const line = this.sponsorLines().find((l) => l.id === id);
    return line ? this.formatTeamTitle(line.title) : '';
  };

  teamAContent = computed(() => {
    const id = this.matchForm.get('team_a_id')?.value;
    const team = this.getTeamById(id);
    return team ? this.formatTeamTitle(team.title) : '';
  });

  teamBContent = computed(() => {
    const id = this.matchForm.get('team_b_id')?.value;
    const team = this.getTeamById(id);
    return team ? this.formatTeamTitle(team.title) : '';
  });

  onSubmit(): void {
    if (this.matchForm.valid) {
      const formData = this.matchForm.value;

      if (this.mode() === 'create') {
        const data: MatchCreate = {
          team_a_id: formData.team_a_id as number,
          team_b_id: formData.team_b_id as number,
          tournament_id: this.tournamentId() || undefined,
          match_date: formData.match_date || null,
          week: formData.week || null,
          match_eesl_id: formData.match_eesl_id || null,
          main_sponsor_id: formData.main_sponsor_id || null,
          sponsor_line_id: formData.sponsor_line_id || null,
          isprivate: false,
        };
        this.submitted.emit(data);
      } else {
        const data: MatchUpdate = {
          team_a_id: formData.team_a_id ?? undefined,
          team_b_id: formData.team_b_id ?? undefined,
          match_date: formData.match_date ?? undefined,
          week: formData.week ?? undefined,
          match_eesl_id: formData.match_eesl_id ?? undefined,
          main_sponsor_id: formData.main_sponsor_id ?? undefined,
          sponsor_line_id: formData.sponsor_line_id ?? undefined,
        };
        this.submitted.emit(data);
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
