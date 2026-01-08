import { ChangeDetectionStrategy, Component, inject, computed, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TeamStoreService } from '../../services/team-store.service';
import { TeamUpdate } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.less',
})
export class TeamEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private teamStore = inject(TeamStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private navigationHelper = inject(NavigationHelperService);

  teamForm = this.fb.group({
    title: ['', [Validators.required]],
    city: [''],
    description: [''],
    team_color: ['#000000', [Validators.required]],
    team_eesl_id: [''],
    team_logo_url: [''],
    team_logo_icon_url: [''],
    team_logo_web_url: [''],
    sponsor_line_id: [''],
    main_sponsor_id: [''],
  });

  teamId = computed(() => {
    const id = this.route.snapshot.paramMap.get('teamId');
    return id ? Number(id) : null;
  });

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

  team = computed(() => {
    const id = this.teamId();
    if (!id) return null;
    return this.teamStore.teams().find((t) => t.id === id) || null;
  });

  private patchFormOnTeamChange = effect(() => {
    const team = this.team();
    if (team) {
      untracked(() => {
        this.teamForm.patchValue({
          title: team.title,
          city: team.city || '',
          description: team.description || '',
          team_color: team.team_color,
          team_eesl_id: team.team_eesl_id?.toString() || '',
          team_logo_url: team.team_logo_url || '',
          team_logo_icon_url: team.team_logo_icon_url || '',
          team_logo_web_url: team.team_logo_web_url || '',
          sponsor_line_id: team.sponsor_line_id?.toString() || '',
          main_sponsor_id: team.main_sponsor_id?.toString() || '',
        });
      });
    }
  });

  navigateToDetail(): void {
    const sportId = this.sportId();
    const teamId = this.teamId();
    const year = this.route.snapshot.queryParamMap.get('year');
    if (sportId && teamId) {
      if (year) {
        this.router.navigate(['/sports', sportId, 'teams', teamId], { queryParams: { year } });
      } else {
        this.router.navigate(['/sports', sportId, 'teams', teamId]);
      }
    }
  }

  onSubmit(): void {
    const teamId = this.teamId();
    if (this.teamForm.valid && teamId) {
      const teamData: TeamUpdate = {
        title: this.teamForm.value.title || '',
        city: this.teamForm.value.city || null,
        description: this.teamForm.value.description || null,
        team_color: this.teamForm.value.team_color || '#000000',
        team_eesl_id: this.teamForm.value.team_eesl_id ? Number(this.teamForm.value.team_eesl_id) : null,
        team_logo_url: this.teamForm.value.team_logo_url || null,
        team_logo_icon_url: this.teamForm.value.team_logo_icon_url || null,
        team_logo_web_url: this.teamForm.value.team_logo_web_url || null,
        sponsor_line_id: this.teamForm.value.sponsor_line_id ? Number(this.teamForm.value.sponsor_line_id) : null,
        main_sponsor_id: this.teamForm.value.main_sponsor_id ? Number(this.teamForm.value.main_sponsor_id) : null,
      };
      withUpdateAlert(
        this.alerts,
        () => this.teamStore.updateTeam(teamId, teamData),
        () => this.navigateToDetail(),
        'Team'
      );
    }
  }
}
