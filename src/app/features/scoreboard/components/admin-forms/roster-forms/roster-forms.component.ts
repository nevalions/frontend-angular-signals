import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox, TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { PlayerMatchUpdate } from '../../../../matches/models/player-match.model';
import { Scoreboard, ScoreboardUpdate } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

type StarterType = 'offense' | 'defense';
type ScoreboardToggleKey =
  | 'is_team_a_start_offense'
  | 'is_team_b_start_offense'
  | 'is_team_a_start_defense'
  | 'is_team_b_start_defense'
  | 'is_match_player_lower'
  | 'is_football_qb_full_stats_lower'
  | 'is_home_match_team_lower'
  | 'is_away_match_team_lower';

interface PlayerOption {
  id: number;
  label: string;
}

interface TeamGroup {
  id: number | null;
  label: string;
  players: PlayerMatchWithDetails[];
}

@Component({
  selector: 'app-roster-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiButton,
    TuiCheckbox,
    TuiChevron,
    TuiDataList,
    TuiSelect,
    TuiTextfield,
    CollapsibleSectionComponent,
  ],
  templateUrl: './roster-forms.component.html',
  styleUrl: './roster-forms.component.less',
})
export class RosterFormsComponent {
  scoreboard = input<Scoreboard | null>(null);
  players = input<PlayerMatchWithDetails[]>([]);

  scoreboardChange = output<Partial<ScoreboardUpdate>>();
  playerUpdate = output<PlayerMatchUpdate>();

  protected readonly teamGroups = computed(() => this.buildTeamGroups());
  protected readonly homeTeam = computed(() => this.teamGroups().home);
  protected readonly awayTeam = computed(() => this.teamGroups().away);

  protected readonly playerOptions = computed(() => this.buildPlayerOptions(this.players()));
  protected readonly qbOptions = computed(() => this.buildQbOptions());

  protected readonly playerLabelMap = computed(() => new Map(this.playerOptions().map((option) => [option.id, option.label])));
  protected readonly qbLabelMap = computed(() => new Map(this.qbOptions().map((option) => [option.id, option.label])));

  protected readonly playerLowerId = computed(() => this.scoreboard()?.player_match_lower_id ?? null);
  protected readonly qbLowerId = computed(() => this.scoreboard()?.football_qb_full_stats_match_lower_id ?? null);

  protected readonly showPlayerLower = computed(() => this.scoreboard()?.is_match_player_lower ?? false);
  protected readonly showQbLower = computed(() => this.scoreboard()?.is_football_qb_full_stats_lower ?? false);
  protected readonly showHomeTeamLower = computed(() => this.scoreboard()?.is_home_match_team_lower ?? false);
  protected readonly showAwayTeamLower = computed(() => this.scoreboard()?.is_away_match_team_lower ?? false);

  protected readonly showHomeOffenseRoster = computed(() => this.scoreboard()?.is_team_a_start_offense ?? false);
  protected readonly showAwayOffenseRoster = computed(() => this.scoreboard()?.is_team_b_start_offense ?? false);
  protected readonly showHomeDefenseRoster = computed(() => this.scoreboard()?.is_team_a_start_defense ?? false);
  protected readonly showAwayDefenseRoster = computed(() => this.scoreboard()?.is_team_b_start_defense ?? false);

  // Local state for roster visibility toggles
  protected readonly localShowHomeOffenseRoster = signal(false);
  protected readonly localShowAwayOffenseRoster = signal(false);
  protected readonly localShowHomeDefenseRoster = signal(false);
  protected readonly localShowAwayDefenseRoster = signal(false);

  // Local state for lower display toggles
  protected readonly localShowPlayerLower = signal(false);
  protected readonly localShowQbLower = signal(false);
  protected readonly localShowHomeTeamLower = signal(false);
  protected readonly localShowAwayTeamLower = signal(false);

  // Sync local state when scoreboard changes
  constructor() {
    effect(() => {
      const sb = this.scoreboard();
      if (sb) {
        this.localShowHomeOffenseRoster.set(sb.is_team_a_start_offense ?? false);
        this.localShowAwayOffenseRoster.set(sb.is_team_b_start_offense ?? false);
        this.localShowHomeDefenseRoster.set(sb.is_team_a_start_defense ?? false);
        this.localShowAwayDefenseRoster.set(sb.is_team_b_start_defense ?? false);
        this.localShowPlayerLower.set(sb.is_match_player_lower ?? false);
        this.localShowQbLower.set(sb.is_football_qb_full_stats_lower ?? false);
        this.localShowHomeTeamLower.set(sb.is_home_match_team_lower ?? false);
        this.localShowAwayTeamLower.set(sb.is_away_match_team_lower ?? false);
      }
    });
  }

  protected readonly playerStringify: TuiStringHandler<number | null> = (value) =>
    value === null ? 'Select player' : this.playerLabelMap().get(value) ?? 'Select player';

  protected readonly qbStringify: TuiStringHandler<number | null> = (value) =>
    value === null ? 'Select QB' : this.qbLabelMap().get(value) ?? 'Select QB';

  onToggleScoreboard(key: ScoreboardToggleKey, value: boolean): void {
    switch (key) {
      case 'is_team_a_start_offense':
        this.localShowHomeOffenseRoster.set(value);
        break;
      case 'is_team_b_start_offense':
        this.localShowAwayOffenseRoster.set(value);
        break;
      case 'is_team_a_start_defense':
        this.localShowHomeDefenseRoster.set(value);
        break;
      case 'is_team_b_start_defense':
        this.localShowAwayDefenseRoster.set(value);
        break;
      case 'is_match_player_lower':
        this.localShowPlayerLower.set(value);
        break;
      case 'is_football_qb_full_stats_lower':
        this.localShowQbLower.set(value);
        break;
      case 'is_home_match_team_lower':
        this.localShowHomeTeamLower.set(value);
        break;
      case 'is_away_match_team_lower':
        this.localShowAwayTeamLower.set(value);
        break;
    }
    this.scoreboardChange.emit({ [key]: value });
  }

  onPlayerLowerSelect(playerId: number | null): void {
    this.scoreboardChange.emit({ player_match_lower_id: playerId ?? null });
  }

  onQbLowerSelect(playerId: number | null): void {
    this.scoreboardChange.emit({ football_qb_full_stats_match_lower_id: playerId ?? null });
  }

  toggleStarter(player: PlayerMatchWithDetails, type: StarterType, checked: boolean): void {
    if (checked) {
      this.playerUpdate.emit({ id: player.id, is_starting: true, starting_type: type });
      return;
    }

    this.playerUpdate.emit({ id: player.id, is_starting: false, starting_type: null });
  }

  selectAllStarters(team: 'home' | 'away', type: StarterType): void {
    const players = team === 'home' ? this.homeTeam().players : this.awayTeam().players;

    players.forEach((player) => {
      this.playerUpdate.emit({ id: player.id, is_starting: true, starting_type: type });
    });
  }

  isStarter(player: PlayerMatchWithDetails, type: StarterType): boolean {
    if (!player.is_starting) {
      return false;
    }

    const normalizedType = player.starting_type ?? 'offense';

    return normalizedType === type;
  }

  getPlayerNumber(player: PlayerMatchWithDetails): string | null {
    return player.match_number || player.player_team_tournament?.player_number || null;
  }

  getPlayerName(player: PlayerMatchWithDetails): string {
    if (player.person) {
      return `${player.person.first_name} ${player.person.second_name}`.trim();
    }

    return `Player ${player.id}`;
  }

  getPlayerPosition(player: PlayerMatchWithDetails): string | null {
    return player.position?.title ?? null;
  }

  private buildTeamGroups(): { home: TeamGroup; away: TeamGroup } {
    const grouped = new Map<number, PlayerMatchWithDetails[]>();
    const players = this.players();

    players.forEach((player) => {
      if (!player.team_id) {
        return;
      }

      const current = grouped.get(player.team_id) ?? [];
      current.push(player);
      grouped.set(player.team_id, current);
    });

    const teamIds = Array.from(grouped.keys()).sort((a, b) => a - b);
    const homeId = teamIds[0] ?? null;
    const awayId = teamIds[1] ?? null;

    return {
      home: this.buildTeamGroup(homeId, grouped, 'Home Team'),
      away: this.buildTeamGroup(awayId, grouped, 'Away Team'),
    };
  }

  private buildTeamGroup(teamId: number | null, grouped: Map<number, PlayerMatchWithDetails[]>, fallback: string): TeamGroup {
    if (teamId === null) {
      return { id: null, label: fallback, players: [] };
    }

    const players = grouped.get(teamId) ?? [];
    const teamLabel = players.find((player) => player.team?.title)?.team?.title ?? fallback;

    return {
      id: teamId,
      label: teamLabel,
      players: this.sortPlayers(players),
    };
  }

  private buildPlayerOptions(players: PlayerMatchWithDetails[]): PlayerOption[] {
    return this.sortPlayers(players).map((player) => ({
      id: player.id,
      label: this.formatPlayerLabel(player),
    }));
  }

  private buildQbOptions(): PlayerOption[] {
    const players = this.players();
    const qbPlayers = players.filter((player) => this.isQuarterback(player));

    return this.buildPlayerOptions(qbPlayers.length ? qbPlayers : players);
  }

  private formatPlayerLabel(player: PlayerMatchWithDetails): string {
    const number = this.getPlayerNumber(player);
    const name = this.getPlayerName(player);
    const position = player.position?.title ? ` • ${player.position.title}` : '';
    const numberLabel = number ? `#${number} ` : '';

    return `${numberLabel}${name}${position}`.trim();
  }

  private isQuarterback(player: PlayerMatchWithDetails): boolean {
    const title = player.position?.title?.toLowerCase() ?? '';
    const category = player.position?.category?.toLowerCase() ?? '';

    return title.includes('qb') || title.includes('quarterback') || category.includes('qb');
  }

  private sortPlayers(players: PlayerMatchWithDetails[]): PlayerMatchWithDetails[] {
    return [...players].sort((a, b) => {
      const teamDiff = (a.team_id ?? 0) - (b.team_id ?? 0);
      if (teamDiff !== 0) {
        return teamDiff;
      }

      const numberA = this.getPlayerNumber(a) ?? '';
      const numberB = this.getPlayerNumber(b) ?? '';

      if (numberA !== numberB) {
        return numberA.localeCompare(numberB, undefined, { numeric: true });
      }

      return this.getPlayerName(a).localeCompare(this.getPlayerName(b));
    });
  }
}
