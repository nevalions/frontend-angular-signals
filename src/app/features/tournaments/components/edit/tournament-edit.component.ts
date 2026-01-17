import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentUpdate } from '../../models/tournament.model';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent implements OnInit {
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
  logoPreviewUrl = signal<string | null>(null);

  currentLogoUrl = computed(() => {
    const url = this.tournament?.tournament_logo_url ?? null;
    return url ? buildStaticUrl(url) : null;
  });

  displayLogoUrl = computed(() => this.logoPreviewUrl() ?? this.currentLogoUrl());

  sportId = this.route.snapshot.paramMap.get('sportId') || '';
  year = this.route.snapshot.paramMap.get('year') || '';
  tournamentId = this.route.snapshot.paramMap.get('id') || '';

  sport = this.sportStore.sports().find((s) => s.id === Number(this.sportId)) || null;
  season = this.seasonStore.seasonByYear().get(Number(this.year)) || null;
  tournament = this.tournamentStore.tournaments().find((t) => t.id === Number(this.tournamentId)) || null;
  loading = this.tournamentStore.loading;

  ngOnInit(): void {
    if (this.tournament) {
      this.tournamentForm.patchValue({
        title: this.tournament.title,
        description: this.tournament.description || '',
        tournament_eesl_id: this.tournament.tournament_eesl_id || null,
        main_sponsor_id: this.tournament.main_sponsor_id || null,
        sponsor_line_id: this.tournament.sponsor_line_id || null,
      });
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
      this.tournamentStore.uploadTournamentLogo(file).subscribe({
        next: (response) => {
          this.logoPreviewUrl.set(buildStaticUrl(response.webview));
          this.logoUploadLoading.set(false);
        },
        error: () => {
          this.logoUploadLoading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid && this.tournamentId && this.tournament) {
      const formData = this.tournamentForm.value;
      const updateData: Partial<TournamentUpdate> = {};

      if (formData.title !== this.tournament.title) {
        updateData.title = formData.title as string;
      }

      const newDescription = formData.description || null;
      if (newDescription !== this.tournament.description) {
        updateData.description = newDescription;
      }

      if (formData.tournament_eesl_id) {
        updateData.tournament_eesl_id = Number(formData.tournament_eesl_id);
      }

      const newLogoUrl = this.logoPreviewUrl();
      if (newLogoUrl) {
        updateData.tournament_logo_url = newLogoUrl.replace(`${API_BASE_URL}/`, '');
      }

      if (formData.main_sponsor_id) {
        updateData.main_sponsor_id = Number(formData.main_sponsor_id);
      }

      if (formData.sponsor_line_id) {
        updateData.sponsor_line_id = Number(formData.sponsor_line_id);
      }

      if (Object.keys(updateData).length > 0) {
        withUpdateAlert(
          this.alerts,
          () => this.tournamentStore.updateTournament(Number(this.tournamentId), updateData),
          () => this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId),
          'Tournament'
        );
      } else {
        this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
      }
    }
  }

  cancel(): void {
    this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
  }
}
