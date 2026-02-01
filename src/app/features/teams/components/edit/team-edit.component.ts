import { ChangeDetectionStrategy, Component, inject, computed, effect, untracked, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TeamStoreService } from '../../services/team-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { TeamUpdate, LogoUploadResponse } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron, ImageUploadComponent],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.less',
})
export class TeamEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private teamStore = inject(TeamStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private navigationHelper = inject(NavigationHelperService);

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

  currentLogoUrls = computed<ImageUrls | null>(() => {
    const team = this.team();
    if (!team || !team.team_logo_url) return null;
    const urls: ImageUrls = {
      original: buildStaticUrl(team.team_logo_url),
    };
    if (team.team_logo_icon_url) {
      urls.icon = buildStaticUrl(team.team_logo_icon_url);
    }
    if (team.team_logo_web_url) {
      urls.webview = buildStaticUrl(team.team_logo_web_url);
    }
    return urls;
  });

  displayLogoUrls = computed(() => this.logoPreviewUrls() ?? this.currentLogoUrls());

  sponsors = this.sponsorStore.sponsors;
  sponsorLines = this.sponsorStore.sponsorLines;

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

  private patchFormOnTeamChange = effect(() => {
    const team = this.team();
    if (team) {
      untracked(() => {
        this.teamForm.patchValue({
          title: team.title,
          city: team.city || '',
          description: team.description || '',
          team_color: team.team_color,
          team_eesl_id: team.team_eesl_id || null,
          sponsor_line_id: team.sponsor_line_id || null,
          main_sponsor_id: team.main_sponsor_id || null,
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
    const teamId = this.teamId();
    if (this.teamForm.valid && teamId) {
      const teamData: TeamUpdate = {
        title: this.teamForm.value.title || '',
        city: this.teamForm.value.city || null,
        description: this.teamForm.value.description || null,
        team_color: this.teamForm.value.team_color || '#000000',
        team_eesl_id: this.teamForm.value.team_eesl_id || null,
        sponsor_line_id: this.teamForm.value.sponsor_line_id || null,
        main_sponsor_id: this.teamForm.value.main_sponsor_id || null,
      };

      const newLogoUrls = this.logoPreviewUrls();
      if (newLogoUrls) {
        teamData.team_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        if (newLogoUrls.icon) {
          teamData.team_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        }
        if (newLogoUrls.webview) {
          teamData.team_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
        }
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
