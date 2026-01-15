import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PlayerStoreService } from '../../services/player-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl } from '../../../../core/config/api.constants';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent, JsonPipe],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.less',
})
export class PlayerDetailComponent {
  private route = inject(ActivatedRoute);
  private playerStore = inject(PlayerStoreService);
  private navigationHelper = inject(NavigationHelperService);
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

  photoUrl = computed(() => {
    const player = this.player();
    return null;
  });

  navigateBack(): void {
    const sportId = this.sportId();
    if (sportId) {
      this.navigationHelper.toSportDetail(sportId, undefined, 'players');
    }
  }
}
