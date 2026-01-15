import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TeamStoreService } from '../../services/team-store.service';
import { TeamCreate, LogoUploadResponse } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-team-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.less',
})
export class TeamCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private teamStore = inject(TeamStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private route = inject(ActivatedRoute);

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

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

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
    const sportId = this.sportId();
    if (this.teamForm.valid && sportId) {
      const formData = this.teamForm.value;
      const newLogoUrls = this.logoPreviewUrls();

      const data: TeamCreate = {
        title: formData.title as string,
        city: formData.city || null,
        description: formData.description || null,
        team_color: formData.team_color || '#000000',
        team_eesl_id: formData.team_eesl_id ? Number(formData.team_eesl_id) : null,
        sponsor_line_id: formData.sponsor_line_id ? Number(formData.sponsor_line_id) : null,
        main_sponsor_id: formData.main_sponsor_id ? Number(formData.main_sponsor_id) : null,
        sport_id: sportId,
      };

      if (newLogoUrls) {
        data.team_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        data.team_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        data.team_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
      }

      withCreateAlert(
        this.alerts,
        () => this.teamStore.createTeam(data),
        () => this.onSuccess(),
        'Team'
      );
    }
  }

  cancel(): void {
    const sportId = this.sportId();
    const year = this.route.snapshot.queryParamMap.get('year');
    if (sportId) {
      this.navigationHelper.toSportDetail(sportId, year ? Number(year) : undefined, 'teams');
    }
  }

  onSuccess(): void {
    this.cancel();
  }
}
