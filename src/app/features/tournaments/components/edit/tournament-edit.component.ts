import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { tuiDialog, TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TeamStoreService } from '../../../teams/services/team-store.service';
import { TournamentUpdate, MoveTournamentToSportResponse } from '../../models/tournament.model';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';
import { TournamentMoveDialogComponent, type TournamentMoveDialogData } from './tournament-move-dialog.component';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, ImageUploadComponent],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private tournamentStore = inject(TournamentStoreService);
  private teamStore = inject(TeamStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  private readonly moveDialog = tuiDialog(TournamentMoveDialogComponent, {
    size: 'm',
    dismissible: true,
    label: 'Move Tournament to Another Sport',
  }) as unknown as (data: TournamentMoveDialogData) => Observable<boolean>;

  tournamentForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    tournament_eesl_id: [null as number | null],
    main_sponsor_id: [null as number | null],
    sponsor_line_id: [null as number | null],
  });

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<ImageUrls | null>(null);
  
  moveSportLoading = signal(false);
  previewData = signal<MoveTournamentToSportResponse | null>(null);

  currentLogoUrls = computed<ImageUrls | null>(() => {
    const tournament = this.tournament;
    if (!tournament || !tournament.tournament_logo_url) return null;
    const urls: ImageUrls = {
      original: buildStaticUrl(tournament.tournament_logo_url),
    };
    if (tournament.tournament_logo_icon_url) {
      urls.icon = buildStaticUrl(tournament.tournament_logo_icon_url);
    }
    if (tournament.tournament_logo_web_url) {
      urls.webview = buildStaticUrl(tournament.tournament_logo_web_url);
    }
    return urls;
  });

  displayLogoUrls = computed(() => this.logoPreviewUrls() ?? this.currentLogoUrls());

  availableSports = computed(() => {
    const sports = this.sportStore.sports();
    if (!this.tournament) return sports;
    return sports.filter(s => s.id !== this.tournament?.sport_id);
  });

  moveSportForm = this.fb.group({
    target_sport_id: [null as number | null, Validators.required],
  });

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

      const newLogoUrls = this.logoPreviewUrls();
      if (newLogoUrls) {
        updateData.tournament_logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
        if (newLogoUrls.icon) {
          updateData.tournament_logo_icon_url = newLogoUrls.icon.replace(`${API_BASE_URL}/`, '');
        }
        if (newLogoUrls.webview) {
          updateData.tournament_logo_web_url = newLogoUrls.webview.replace(`${API_BASE_URL}/`, '');
        }
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

  onMoveToSport(): void {
    if (!this.tournamentId || !this.tournament) return;

    const targetSportId = this.moveSportForm.value.target_sport_id;
    if (!targetSportId) return;

    this.previewData.set(null);
    this.fetchPreview(targetSportId);
  }

  fetchPreview(targetSportId: number): void {
    if (!this.tournamentId) return;

    this.moveSportLoading.set(true);

    this.tournamentStore.moveTournamentToSport(
      Number(this.tournamentId),
      {
        target_sport_id: targetSportId,
        preview: true,
        move_conflicting_tournaments: false
      }
    ).subscribe({
      next: (preview) => {
        this.previewData.set(preview);
        this.moveSportLoading.set(false);
        this.showConfirmDialog(targetSportId);
      },
      error: () => {
        this.moveSportLoading.set(false);
        this.alerts.open('Failed to load preview', { label: 'Error', appearance: 'negative' }).subscribe();
      }
    });
  }

  showConfirmDialog(targetSportId: number): void {
    const preview = this.previewData();
    if (!preview) return;

    const targetSport = this.sportStore.sports().find(s => s.id === targetSportId);
    const sportName = targetSport?.title || 'selected sport';

    let content = `Move Tournament to "${sportName}"\n\nThis will move:\n`;
    content += `• ${preview.updated_counts.tournament} tournament(s)\n`;
    content += `• ${preview.updated_counts.teams} team(s)\n`;
    content += `• ${preview.updated_counts.players} player(s)\n`;

    const hasConflicts = preview.conflicts.teams.length > 0 || preview.conflicts.players.length > 0;
    if (hasConflicts) {
      content += `\n⚠️ Conflicts Detected:\n`;
      
      if (preview.conflicts.teams.length > 0) {
        content += `\nTeams shared with other tournaments:\n`;
        preview.conflicts.teams.forEach(conflict => {
          const team = this.getTeamName(conflict.entity_id);
          const tournamentNames = conflict.tournament_ids.map(id => this.getTournamentName(id)).filter(Boolean);
          content += `• ${team} is shared with: ${tournamentNames.join(', ')}\n`;
        });
      }

      if (preview.conflicts.players.length > 0) {
        content += `\nPlayers shared with other tournaments:\n`;
        preview.conflicts.players.forEach(conflict => {
          const player = this.getPlayerName(conflict.entity_id);
          const tournamentNames = conflict.tournament_ids.map(id => this.getTournamentName(id)).filter(Boolean);
          content += `• ${player} is shared with: ${tournamentNames.join(', ')}\n`;
        });
      }

      content += `\nConfirming will move this tournament and all related tournaments to "${sportName}".`;
    }

    this.moveDialog({
      content,
      confirmLabel: hasConflicts ? 'Move All Related Tournaments' : 'Confirm Move',
      confirmText: 'I understand this will move the tournament and related data to another sport.',
    }).pipe(
      switchMap((confirmed) => {
        if (!confirmed) return EMPTY;

        return this.tournamentStore.moveTournamentToSport(
          Number(this.tournamentId),
          {
            target_sport_id: targetSportId,
            preview: false,
            move_conflicting_tournaments: hasConflicts
          }
        ).pipe(
          tap(() => {
            this.sportStore.reload();
            this.tournamentStore.reload();
            const preview = this.previewData();
            const message = `Successfully moved ${preview?.moved_tournaments.length || 1} tournament(s)`;
            this.alerts.open(message, { label: 'Success', appearance: 'positive', autoClose: 3000 }).subscribe(() => {
              const newSportId = String(targetSportId);
              this.navigationHelper.toTournamentDetail(newSportId, this.year, this.tournamentId);
            });
          }),
          catchError((error) => {
            if (error.status === 409) {
              this.alerts.open(
                'Conflict detected. Please use "Move all related tournaments" to resolve conflicts.',
                { label: 'Error', appearance: 'negative' }
              ).subscribe();
            } else if (error.status === 404) {
              this.alerts.open('Tournament or sport not found', { label: 'Error', appearance: 'negative' }).subscribe();
            } else {
              this.alerts.open('Failed to move tournament', { label: 'Error', appearance: 'negative' }).subscribe();
            }
            return throwError(() => error);
          })
        );
      })
    ).subscribe();
  }

  getTeamName(teamId: number): string {
    const team = this.teamStore.teams().find((t: { id: number; title: string }) => t.id === teamId);
    return team?.title || `Team ${teamId}`;
  }

  getPlayerName(playerId: number): string {
    return `Player ${playerId}`;
  }

  getTournamentName(tournamentId: number): string {
    const tournament = this.tournamentStore.tournaments().find(t => t.id === tournamentId);
    return tournament?.title || `Tournament ${tournamentId}`;
  }
}
