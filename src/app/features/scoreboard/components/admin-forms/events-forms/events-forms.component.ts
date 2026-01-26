import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiIcon, TuiLabel, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiInputNumber, TuiSelect, TuiChevron } from '@taiga-ui/kit';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { FootballEvent, FootballEventCreate, FootballEventUpdate } from '../../../../matches/models/football-event.model';
import { MatchStats, FootballTeamStats, FootballQBStats } from '../../../../matches/models/match-stats.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { WebSocketService } from '../../../../../core/services/websocket.service';

interface PlayerOption {
  id: number;
  label: string;
}

interface EventRowDisplay {
  event: FootballEvent;
  qtr: string;
  down: string;
  playType: string;
  result: string;
  players: string;
}

@Component({
  selector: 'app-events-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiButton,
    TuiDataList,
    TuiIcon,
    TuiInputNumber,
    TuiLabel,
    TuiSelect,
    TuiTextfield,
    TuiTextfieldDropdownDirective,
    TuiChevron,
    CollapsibleSectionComponent,
  ],
  templateUrl: './events-forms.component.html',
  styleUrl: './events-forms.component.less',
})
export class EventsFormsComponent {
  private wsService = inject(WebSocketService);
  matchStats = input<MatchStats | null>(null);
  events = input<FootballEvent[]>([]);
  players = input<PlayerMatchWithDetails[]>([]);
  fieldLength = input<number>(100);

  private lastStatsUpdate = 0;
  protected readonly isUpdating = signal(false);

  eventCreate = output<FootballEventCreate>();
  eventUpdate = output<{ id: number; data: FootballEventUpdate }>();
  eventDelete = output<number>();
  fieldLengthChange = output<number>();

  protected readonly editingEventId = signal<number | null>(null);
  protected readonly newEventForm = signal<Partial<FootballEventCreate> | null>(null);

  // Team stats from match stats
  protected readonly homeTeamStats = computed((): FootballTeamStats | null => {
    return this.matchStats()?.team_a?.team_stats ?? null;
  });

  protected readonly awayTeamStats = computed((): FootballTeamStats | null => {
    return this.matchStats()?.team_b?.team_stats ?? null;
  });

  // QB stats
  protected readonly homeQbStats = computed((): FootballQBStats | null => {
    return this.matchStats()?.team_a?.qb_stats ?? null;
  });

  protected readonly awayQbStats = computed((): FootballQBStats | null => {
    return this.matchStats()?.team_b?.qb_stats ?? null;
  });

  private updateEffect = effect(() => {
    const updateTime = this.wsService.lastStatsUpdate();
    if (updateTime && updateTime > this.lastStatsUpdate) {
      this.lastStatsUpdate = updateTime;

      this.isUpdating.set(true);
      setTimeout(() => this.isUpdating.set(false), 500);
    }
  });

  // Player options for dropdowns
  protected readonly playerOptions = computed((): PlayerOption[] => {
    return this.players().map((player) => ({
      id: player.id,
      label: this.formatPlayerLabel(player),
    }));
  });

  protected readonly playerLabelMap = computed(
    () => new Map(this.playerOptions().map((option) => [option.id, option.label]))
  );

  protected readonly playerStringify: TuiStringHandler<number | null> = (value) =>
    value === null ? 'Select player' : this.playerLabelMap().get(value) ?? 'Select player';

  // Events for display in table
  protected readonly eventRows = computed((): EventRowDisplay[] => {
    return this.events()
      .slice()
      .sort((a, b) => (a.event_number ?? 0) - (b.event_number ?? 0))
      .map((event) => ({
        event,
        qtr: event.event_qtr ? `Q${event.event_qtr}` : '-',
        down: event.event_down && event.event_distance ? `${event.event_down} & ${event.event_distance}` : '-',
        playType: event.play_type ?? '-',
        result: this.formatEventResult(event),
        players: this.formatEventPlayers(event),
      }));
  });

  protected readonly playTypes = [
    'Run',
    'Pass',
    'Punt',
    'Kickoff',
    'Field Goal',
    'Extra Point',
    'Two Point Conversion',
    'Kneel',
    'Spike',
    'Penalty',
  ];

  protected readonly playResults = [
    'Complete',
    'Incomplete',
    'Gain',
    'No Gain',
    'Loss',
    'Touchdown',
    'Interception',
    'Fumble',
    'Sack',
    'Safety',
    'Good',
    'No Good',
    'Blocked',
  ];

  formatStat(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toString();
  }

  formatDecimal(value: number | null | undefined, decimals = 1): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toFixed(decimals);
  }

  startNewEvent(): void {
    const nextNumber = Math.max(0, ...this.events().map((e) => e.event_number ?? 0)) + 1;
    this.newEventForm.set({
      event_number: nextNumber,
      event_qtr: 1,
      event_down: 1,
      event_distance: 10,
      play_type: null,
      play_result: null,
    });
    this.editingEventId.set(null);
  }

  cancelNewEvent(): void {
    this.newEventForm.set(null);
  }

  saveNewEvent(): void {
    const form = this.newEventForm();
    if (!form) return;

    this.eventCreate.emit(form as FootballEventCreate);
    this.newEventForm.set(null);
  }

  editEvent(event: FootballEvent): void {
    this.editingEventId.set(event.id);
    this.newEventForm.set(null);
  }

  cancelEdit(): void {
    this.editingEventId.set(null);
  }

  updateNewEventField(field: keyof FootballEventCreate, value: unknown): void {
    const form = this.newEventForm();
    if (!form) return;
    this.newEventForm.set({ ...form, [field]: value });
  }

  saveEventEdit(event: FootballEvent, updates: Partial<FootballEventUpdate>): void {
    this.eventUpdate.emit({ id: event.id, data: updates });
    this.editingEventId.set(null);
  }

  confirmDeleteEvent(event: FootballEvent): void {
    if (confirm(`Delete event #${event.event_number ?? event.id}?`)) {
      this.eventDelete.emit(event.id);
    }
  }

  onFieldLengthChange(value: number): void {
    this.fieldLengthChange.emit(value);
  }

  protected formatPlayerLabel(player: PlayerMatchWithDetails): string {
    const number = player.match_number || player.player_team_tournament?.player_number;
    const name = player.person
      ? `${player.person.first_name} ${player.person.second_name}`.trim()
      : `Player ${player.id}`;
    const position = player.position?.title ? ` • ${player.position.title}` : '';
    const numberLabel = number ? `#${number} ` : '';

    return `${numberLabel}${name}${position}`.trim();
  }

  private formatEventResult(event: FootballEvent): string {
    const parts: string[] = [];

    if (event.play_result) {
      parts.push(event.play_result);
    }

    if (event.distance_on_offence !== null && event.distance_on_offence !== undefined) {
      parts.push(`${event.distance_on_offence} yds`);
    }

    if (event.score_result) {
      parts.push(event.score_result);
    }

    return parts.length ? parts.join(', ') : '-';
  }

  private formatEventPlayers(event: FootballEvent): string {
    const playerIds: number[] = [];

    if (event.run_player) playerIds.push(event.run_player);
    if (event.pass_received_player) playerIds.push(event.pass_received_player);
    if (event.event_qb) playerIds.push(event.event_qb);
    if (event.tackle_player) playerIds.push(event.tackle_player);

    if (!playerIds.length) return '-';

    const labelMap = this.playerLabelMap();
    return playerIds
      .slice(0, 2)
      .map((id) => labelMap.get(id) ?? `#${id}`)
      .join(', ');
  }
}
