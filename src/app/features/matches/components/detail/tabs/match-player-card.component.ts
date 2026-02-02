import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiBadge, TuiSwitch } from '@taiga-ui/kit';
import { TuiSurface } from '@taiga-ui/core';
import { PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';

@Component({
  selector: 'app-match-player-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TuiBadge, TuiSwitch, TuiSurface],
  template: `
    <div
      [tuiSurface]="isBench() ? 'base' : 'neutral'"
      class="match-players-tab__player-card"
      [class.match-players-tab__player-card--bench]="isBench()"
      (click)="onOpen()">
      <div class="match-players-tab__player-main">
        <div class="match-players-tab__player-meta" [class.match-players-tab__player-meta--bench]="isBench()">
          <div class="match-players-tab__number-row" [class.match-players-tab__number-row--bench]="isBench()">
            <div
              class="match-players-tab__player-number-badge"
              [class.match-players-tab__player-number-badge--bench]="isBench()"
              [class.match-players-tab__player-number-badge--duplicate]="hasDuplicateNumber()">
              {{ playerNumber }}
            </div>
          </div>
          @if (player().position) {
            <span class="match-players-tab__position-text match-players-tab__position-text--under-number">
              {{ player().position?.title }}
            </span>
          }
        </div>
        <div class="match-players-tab__player-details">
          <div class="match-players-tab__name-row">
            <span
              class="match-players-tab__player-name"
              [class.match-players-tab__player-name--bench]="isBench()">
              {{ playerName.toUpperCase() }}
            </span>
            @if (hasDuplicateNumber()) {
              <tui-badge appearance="warning" size="s" class="match-players-tab__duplicate-badge">!</tui-badge>
            }
          </div>
          <div class="match-players-tab__player-switch" [class.match-players-tab__player-switch--bench]="isBench()">
            <input
              type="checkbox"
              tuiSwitch
              [ngModel]="player().is_starting || false"
              (ngModelChange)="onToggleStarting($event)"
              (click)="$event.stopPropagation()"
              class="match-players-tab__switch"
            />
            <span class="match-players-tab__player-switch-label">
              {{ player().is_starting ? 'Remove from starters' : 'Add to starters' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './match-player-card.component.less',
})
export class MatchPlayerCardComponent {
  player = input.required<PlayerMatchWithDetails>();
  isBench = input(false);
  hasDuplicateNumber = input(false);

  open = output<PlayerMatchWithDetails>();
  toggleStarting = output<{ playerId: number; isStarting: boolean }>();

  get playerNumber(): string {
    return this.player().match_number || this.player().player_team_tournament?.player_number || '-';
  }

  get playerName(): string {
    return this.getFullName(this.player().person);
  }

  onOpen(): void {
    this.open.emit(this.player());
  }

  onToggleStarting(isStarting: boolean): void {
    this.toggleStarting.emit({ playerId: this.player().id, isStarting });
  }

  private getFullName(
    person: { first_name?: string | null; second_name?: string | null } | null | undefined
  ): string {
    if (!person) return 'Unknown';
    const firstName = person.first_name || '';
    const secondName = person.second_name || '';
    const fullName = `${firstName} ${secondName}`.trim();
    return fullName || 'Unknown';
  }
}
