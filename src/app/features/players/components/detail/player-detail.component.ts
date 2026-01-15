import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl } from '../../../../core/config/api.constants';
import { Player } from '../../models/player.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PlayerStoreService } from '../../services/player-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.less',
})
export class PlayerDetailComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private router = inject(Router);
  private playerStore = inject(PlayerStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  playerId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('playerId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  fromSport = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('fromSport');
      return val === 'true';
    })),
    { initialValue: false }
  );

  fromTournamentId = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('tournamentId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  fromYear = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  isInSportContext = computed(() => this.fromSport() === true);

  customMenuItems = computed<CustomMenuItem[]>(() => {
    if (this.isInSportContext()) {
      return [{ id: 'remove-from-sport', label: 'Remove from sport', type: 'danger', icon: '@tui.trash' }];
    }
    return [];
  });

  playerResource = httpResource<Player>(() => {
    const playerId = this.playerId();
    if (!playerId) return undefined;
    return buildApiUrl(`/api/players/id/${playerId}/person`);
  });

  player = computed(() => this.playerResource.value());

  loading = computed(() => this.playerResource.isLoading());
  error = computed(() => this.playerResource.error());

  playerName = computed(() => {
    const player = this.player();
    return player ? `${player.first_name || ''} ${player.second_name || ''}`.trim() : '';
  });

  careerByTeam = computed(() => {
    const player = this.player();
    if (!player?.player_team_tournaments) return [];

    const teamMap = new Map<number | null, { teamTitle: string; assignments: any[] }>();

    player.player_team_tournaments.forEach(ptt => {
      const teamId = ptt.team_id;
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, {
          teamTitle: ptt.team_title || 'Unknown Team',
          assignments: []
        });
      }
      teamMap.get(teamId)!.assignments.push(ptt);
    });

    return Array.from(teamMap.values());
  });

  careerByTournament = computed(() => {
    const player = this.player();
    if (!player?.player_team_tournaments) return [];

    const tournamentMap = new Map<number | null, { tournamentId: number | null; assignments: any[] }>();

    player.player_team_tournaments.forEach(ptt => {
      const tournamentId = ptt.tournament_id;
      if (!tournamentMap.has(tournamentId)) {
        tournamentMap.set(tournamentId, {
          tournamentId: tournamentId,
          assignments: []
        });
      }
      tournamentMap.get(tournamentId)!.assignments.push(ptt);
    });

    return Array.from(tournamentMap.values());
  });

  navigateBack(): void {
    const sportId = this.sportId();
    const fromSport = this.fromSport();
    const fromTournamentId = this.fromTournamentId();
    const fromYear = this.fromYear();

    if (!sportId) return;

    if (!fromSport && fromTournamentId && fromYear) {
      this.navigationHelper.toTournamentDetail(sportId, fromYear, fromTournamentId, 'players');
    } else {
      this.navigationHelper.toSportDetail(sportId, undefined, 'players');
    }
  }

  onCustomItemClick(itemId: string): void {
    if (itemId === 'remove-from-sport') {
      const player = this.player();
      const sportId = this.sportId();
      const personId = player?.person_id;
      if (!player || !sportId || !personId) return;

      withDeleteConfirm(
        this.dialogs,
        this.alerts,
        {
          label: `Remove player "${this.playerName()}" from this sport?`,
          content: 'This action cannot be undone!',
        },
        () => this.playerStore.removePersonFromSport(personId, sportId),
        () => this.navigateBack(),
        'Player'
      );
    }
  }
}
