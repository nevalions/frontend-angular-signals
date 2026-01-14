import { ChangeDetectionStrategy, Component, inject, computed, effect, untracked, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TeamStoreService } from '../../services/team-store.service';
import { TeamUpdate, LogoUploadResponse } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

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
    sponsor_line_id: [''],
    main_sponsor_id: [''],
  });

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<{ original: string; icon: string; webview: string } | null>(null);

  currentLogoUrls = computed(() => {
    const team = this.team();
    if (!team) return null;
    return {
      original: team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null,
      icon: team.team_logo_icon_url ? buildStaticUrl(team.team_logo_icon_url) : null,
      webview: team.team_logo_web_url ? buildStaticUrl(team.team_logo_web_url) : null,
    };
  });

  displayLogoUrls = computed(() => this.logoPreviewUrls() ?? this.currentLogoUrls());

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
      this.navigationHelper.toTeamDetail(sportId, teamId, year ? Number(year) : undefined);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.alerts.open('Please select an image file', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.alerts.open('File size must be less than 5MB', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      this.logoUploadLoading.set(true);
      this.teamStore.uploadTeamLogo(file).subscribe({
        next: (response: LogoUploadResponse) => {
          this.logoPreviewUrls.set({
            original: buildStaticUrl(response.original),
            icon: buildStaticUrl(response.icon),
            webview: buildStaticUrl(response.webview),
          });
          this.logoUploadLoading.set(false);
        },
        error: () => {
          this.logoUploadLoading.set(false);
        },
      });
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
        sponsor_line_id: this.teamForm.value.sponsor_line_id ? Number(this.teamForm.value.sponsor_line_id) : null,
        main_sponsor_id: this.teamForm.value.main_sponsor_id ? Number(this.teamForm.value.main_sponsor_id) : null,
      };

      const newLogoUrls = this.logoPreviewUrls();
      if (newLogoUrls) {
        teamData.team_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        teamData.team_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        teamData.team_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
      }

      withUpdateAlert(
        this.alerts,
        () => this.teamStore.updateTeam(teamId, teamData),
        () => this.navigateToDetail(),
        'Team'
      );
    }
  }
}
