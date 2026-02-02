import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TuiAvatar,
  TuiBadge,
  TuiComboBox,
  TuiFilterByInputPipe,
  TuiStatus,
  TuiChevron
} from '@taiga-ui/kit';
import {
  TuiButton,
  TuiDataList,
  TuiIcon,
  TuiSurface,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Team } from '../../../models/match.model';
import { MatchAvailablePlayer } from '../../../models/available-player.model';
import { PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';
import { MatchPlayerCardComponent } from './match-player-card.component';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';

@Component({
  selector: 'app-match-team-roster',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatchPlayerCardComponent,
    TuiAvatar,
    TuiBadge,
    TuiStatus,
    TuiTitle,
    TuiIcon,
    TuiSurface,
    TuiCardLarge,
    TuiHeader,
    TuiTextfield,
    TuiButton,
    TuiDataList,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe,
  ],
  template: `
    <div tuiCardLarge tuiSurface="floating" class="match-players-tab__team-card">
      <header tuiHeader class="match-players-tab__team-header">
        <tui-avatar [src]="teamLogoUrl()" size="l" class="match-players-tab__team-avatar">
          {{ teamInitials() }}
        </tui-avatar>
        <hgroup tuiTitle>
          <h3>{{ team().title.toUpperCase() }}</h3>
        </hgroup>
      </header>

      <div class="match-players-tab__team-actions">
        <div class="match-players-tab__team-controls">
          <button
            type="button"
            tuiButton
            appearance="primary"
            size="s"
            [iconStart]="addPlayerOpen() ? '@tui.x' : '@tui.plus'"
            class="match-players-tab__add-button"
            (click)="toggleAddPlayer.emit()">
            @if (addPlayerOpen()) {
              Cancel
            } @else {
              Add Player
            }
          </button>
        </div>
        <tui-badge appearance="neutral" size="s" class="match-players-tab__team-count">
          @if (availablePlayersLoading()) {
            Loading...
          } @else {
            Available: {{ availablePlayers().length }}
          }
        </tui-badge>
      </div>

      @if (addPlayerOpen()) {
        <div class="match-players-tab__add-form">
          <div class="match-players-tab__add-field">
            <tui-textfield tuiChevron iconStart="@tui.search" [stringify]="stringifyAvailablePlayer" tuiTextfieldSize="m">
              <label tuiLabel>Search available players</label>
              <input
                placeholder="Search by number or name..."
                tuiComboBox
                [(ngModel)]="selectedAvailablePlayerValue"
                [disabled]="availablePlayersLoading()" />
              <tui-data-list *tuiTextfieldDropdown size="l" class="match-players-tab__dropdown-list">
                @if (availablePlayersLoading()) {
                  <div class="match-players-tab__dropdown-loading">Loading available players...</div>
                } @else if (availablePlayersError()) {
                  <div class="match-players-tab__dropdown-error">{{ availablePlayersError() }}</div>
                } @else if (availablePlayers().length === 0) {
                  <div class="match-players-tab__dropdown-empty">No available players</div>
                } @else {
                  @for (player of availablePlayers() | tuiFilterByInput; track player.id) {
                    <button
                      new
                      tuiOption
                      type="button"
                      [value]="player"
                      class="match-players-tab__dropdown-option">
                      {{ stringifyAvailablePlayer(player) }}
                    </button>
                  }
                }
              </tui-data-list>
            </tui-textfield>
          </div>
          <div class="match-players-tab__add-actions">
            <button
              type="button"
              tuiButton
              appearance="primary"
              class="match-players-tab__add-submit"
              size="s"
              [disabled]="!selectedAvailablePlayer()"
              (click)="addPlayer.emit()">
              Add to Match
            </button>
          </div>
        </div>
      }

      <div class="match-players-tab__sort-bar">
        <span class="match-players-tab__sort-label">Sort:</span>
        <div class="match-players-tab__sort-group">
          <button
            type="button"
            tuiButton
            appearance="flat"
            size="s"
            class="match-players-tab__sort-button"
            [class.match-players-tab__sort-button--active]="sort() === 'number'"
            (click)="sortChange.emit('number')">
            Number
          </button>
          <button
            type="button"
            tuiButton
            appearance="flat"
            size="s"
            class="match-players-tab__sort-button"
            [class.match-players-tab__sort-button--active]="sort() === 'name'"
            (click)="sortChange.emit('name')">
            Name
          </button>
        </div>
      </div>

      @if (starters().length > 0) {
        <div class="match-players-tab__roster-section">
          <div class="match-players-tab__section-header">
            <tui-icon icon="@tui.star" class="match-players-tab__section-icon match-players-tab__section-icon--starter" />
            <span class="match-players-tab__section-title">Starting Lineup</span>
            <tui-badge appearance="positive" size="s" tuiStatus>
              {{ starters().length }}
            </tui-badge>
          </div>
          <div class="match-players-tab__players-list">
            @for (player of starters(); track player.id) {
              <app-match-player-card
                [player]="player"
                [hasDuplicateNumber]="hasDuplicateNumber()(player)"
                (open)="openPlayer.emit($event)"
                (toggleStarting)="togglePlayerStarting.emit($event)" />
            }
          </div>
        </div>
      }

      @if (bench().length > 0) {
        <div class="match-players-tab__roster-section">
          <div class="match-players-tab__section-header">
            <tui-icon icon="@tui.users" class="match-players-tab__section-icon" />
            <span class="match-players-tab__section-title">Bench</span>
            <tui-badge appearance="neutral" size="s">
              {{ bench().length }}
            </tui-badge>
          </div>
          <div class="match-players-tab__players-list match-players-tab__players-list--bench">
            @for (player of bench(); track player.id) {
              <app-match-player-card
                [player]="player"
                [isBench]="true"
                [hasDuplicateNumber]="hasDuplicateNumber()(player)"
                (open)="openPlayer.emit($event)"
                (toggleStarting)="togglePlayerStarting.emit($event)" />
            }
          </div>
        </div>
      }

      @if (totalPlayers() === 0) {
        <div class="match-players-tab__empty-roster">
          <tui-icon icon="@tui.users" class="match-players-tab__empty-icon" />
          <span>No players registered</span>
        </div>
      }
    </div>
  `,
  styleUrl: './match-team-roster.component.less',
})
export class MatchTeamRosterComponent {
  team = input.required<Team>();
  teamLogoUrl = input<string | null>(null);
  teamInitials = input('??');
  addPlayerOpen = input(false);
  availablePlayers = input<MatchAvailablePlayer[]>([]);
  availablePlayersLoading = input(false);
  availablePlayersError = input<string | null>(null);
  selectedAvailablePlayer = input<MatchAvailablePlayer | null>(null);
  sort = input<'number' | 'name'>('number');
  starters = input<PlayerMatchWithDetails[]>([]);
  bench = input<PlayerMatchWithDetails[]>([]);
  totalPlayers = input(0);
  hasDuplicateNumber = input<(player: PlayerMatchWithDetails) => boolean>(() => false);

  toggleAddPlayer = output<void>();
  addPlayer = output<void>();
  sortChange = output<'number' | 'name'>();
  selectedAvailablePlayerChange = output<MatchAvailablePlayer | null>();
  openPlayer = output<PlayerMatchWithDetails>();
  togglePlayerStarting = output<{ playerId: number; isStarting: boolean }>();

  get selectedAvailablePlayerValue(): MatchAvailablePlayer | null {
    return this.selectedAvailablePlayer();
  }

  set selectedAvailablePlayerValue(player: MatchAvailablePlayer | null) {
    this.selectedAvailablePlayerChange.emit(player);
  }

  stringifyAvailablePlayer(player: MatchAvailablePlayer | null): string {
    if (!player) return '';
    const number = player.player_team_tournament?.player_number;
    const firstName = capitalizeNameUtil(player.person?.first_name ?? null);
    const secondName = capitalizeNameUtil(player.person?.second_name ?? null);
    const name = `${secondName} ${firstName}`.trim();
    const position = player.position?.title ? ` — ${player.position.title}` : '';
    const numberLabel = number ? `#${number}` : '#-';
    return `${numberLabel} ${name}${position}`.trim();
  }
}
