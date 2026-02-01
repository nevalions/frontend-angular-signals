import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TeamStoreService } from '../../services/team-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { TeamCreate, LogoUploadResponse } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-team-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron, ImageUploadComponent],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.less',
})
export class TeamCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private teamStore = inject(TeamStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private route = inject(ActivatedRoute);

  teamForm = this.fb.group({
    title: ['', [Validators.required]],
    city: [''],
    description: [''],
    team_color: ['#000000', [Validators.required]],
    team_eesl_id: [null as number | null],
    sponsor_line_id: [null as number | null],
    main_sponsor_id: [null as number | null],
  });

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<ImageUrls | null>(null);

  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

  sponsorContent = computed(() => {
    const id = this.teamForm.get('main_sponsor_id')?.value;
    const sponsor = this.sponsors().find((s) => s.id === id);
    return sponsor ? this.formatTitle(sponsor.title) : '';
  });

  sponsorLineContent = computed(() => {
    const id = this.teamForm.get('sponsor_line_id')?.value;
    const line = this.sponsorLines().find((l) => l.id === id);
    return line ? this.formatTitle(line.title) : '';
  });

  sponsorStringify: TuiStringHandler<number> = (id) => {
    const sponsor = this.sponsors().find((s) => s.id === id);
    return sponsor ? this.formatTitle(sponsor.title) : '';
  };

  sponsorLineStringify: TuiStringHandler<number> = (id) => {
    const line = this.sponsorLines().find((l) => l.id === id);
    return line ? this.formatTitle(line.title) : '';
  };

  formatTitle(title: string | null | undefined): string {
    return title?.toUpperCase() || '';
  }

  onLogoUpload(file: File): void {
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

  onLogoRemove(): void {
    this.logoPreviewUrls.set(null);
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
        team_eesl_id: formData.team_eesl_id || null,
        sponsor_line_id: formData.sponsor_line_id || null,
        main_sponsor_id: formData.main_sponsor_id || null,
        sport_id: sportId,
      };

      if (newLogoUrls) {
        data.team_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        if (newLogoUrls.icon) {
          data.team_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        }
        if (newLogoUrls.webview) {
          data.team_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
        }
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
