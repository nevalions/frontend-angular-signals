import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentCreate } from '../../models/tournament.model';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.less',
})
export class TournamentCreateComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
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
  logoPreviewUrls = signal<{ original: string; icon: string; webview: string } | null>(null);

  sportId = Number(this.route.snapshot.paramMap.get('sportId')) || 0;
  year = Number(this.route.snapshot.paramMap.get('year')) || 0;

  sport = this.sportStore.sports().find((s) => s.id === this.sportId) || null;
  season = this.seasonStore.seasonByYear().get(this.year) || null;

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
        data.tournament_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        data.tournament_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
      }

      withCreateAlert(
        this.alerts,
        () => this.tournamentStore.createTournament(data),
        () => this.cancel(),
        'Tournament'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toTournamentsList(this.sportId, this.year);
  }
}
