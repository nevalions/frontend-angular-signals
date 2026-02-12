import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { SponsorStoreService } from '../../../sponsors/services/sponsor-store.service';
import { TournamentCreate } from '../../models/tournament.model';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';
import type { Sponsor } from '../../../../shared/types';
import type { SponsorLine } from '../../../sponsors/models/sponsor-line.model';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TuiButton, TuiSelect, TuiDataList, TuiTextfield, TuiChevron, ImageUploadComponent],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.less',
})
export class TournamentCreateComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private sponsorStore = inject(SponsorStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  tournamentForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    tournament_eesl_id: [null as number | null],
    main_sponsor_id: [null as number | null],
    sponsor_line_id: [null as number | null],
  });

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<ImageUrls | null>(null);

  sportId = Number(this.route.snapshot.paramMap.get('sportId')) || 0;
  year = Number(this.route.snapshot.paramMap.get('year')) || 0;

  sport = this.sportStore.sports().find((s) => s.id === this.sportId) || null;
  season = this.seasonStore.seasonByYear().get(this.year) || null;

  onLogoUpload(file: File): void {
    this.logoUploadLoading.set(true);
    this.tournamentStore.uploadTournamentLogo(file).subscribe({
      next: (response) => {
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
    if (this.tournamentForm.valid) {
      const formData = this.tournamentForm.value;
      const season = this.seasonStore.seasonByYear().get(this.year);
      if (!season) {
        return;
      }
      const newLogoUrls = this.logoPreviewUrls();

      const data: TournamentCreate = {
        title: formData.title as string,
        description: (formData.description as string) || null,
        sport_id: this.sportId,
        season_id: season.id,
        tournament_eesl_id: formData.tournament_eesl_id || null,
        main_sponsor_id: formData.main_sponsor_id || null,
        sponsor_line_id: formData.sponsor_line_id || null,
      };

      if (newLogoUrls) {
        data.tournament_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        if (newLogoUrls.icon) {
          data.tournament_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        }
        if (newLogoUrls.webview) {
          data.tournament_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
        }
      }

      withCreateAlert(
        this.alerts,
        () => this.tournamentStore.createTournament(data),
        () => this.navigationHelper.toSportDetail(this.sportId, this.year, 'tournaments'),
        'Tournament'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toTournamentsList(this.sportId, this.year);
  }

  sponsors = computed(() => this.sponsorStore.sponsors());
  sponsorLines = computed(() => this.sponsorStore.sponsorLines());

  getSponsorById(id: number | null | undefined): Sponsor | null {
    if (!id) return null;
    return this.sponsors().find((sponsor) => sponsor.id === id) || null;
  }

  getSponsorLineById(id: number | null | undefined): SponsorLine | null {
    if (!id) return null;
    return this.sponsorLines().find((line) => line.id === id) || null;
  }

  formatTitle(title: string | null | undefined): string {
    return title?.toUpperCase() || '';
  }

  sponsorStringify: TuiStringHandler<number> = (id) => {
    const sponsor = this.getSponsorById(id);
    return sponsor ? this.formatTitle(sponsor.title) : '';
  };

  sponsorLineStringify: TuiStringHandler<number> = (id) => {
    const line = this.getSponsorLineById(id);
    return line ? this.formatTitle(line.title) : '';
  };

  sponsorContent = computed(() => {
    const id = this.tournamentForm.get('main_sponsor_id')?.value;
    const sponsor = this.getSponsorById(id);
    return sponsor ? this.formatTitle(sponsor.title) : '';
  });

  sponsorLineContent = computed(() => {
    const id = this.tournamentForm.get('sponsor_line_id')?.value;
    const line = this.getSponsorLineById(id);
    return line ? this.formatTitle(line.title) : '';
  });
}
