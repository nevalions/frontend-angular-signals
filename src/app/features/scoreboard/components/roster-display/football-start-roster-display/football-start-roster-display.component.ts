import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PlayerMatchWithDetails } from '../../../../matches/models/comprehensive-match.model';
import { Scoreboard } from '../../../../matches/models/scoreboard.model';
import { Team } from '../../../../matches/models/match.model';
import {
  rosterGroupStaggerAnimation,
  slideInLeftAnimation,
  slideInRightAnimation,
} from '../../../animations';
import { RosterGroupBacksComponent } from '../position-groups/roster-group-backs.component';
import { RosterGroupDbComponent } from '../position-groups/roster-group-db.component';
import { RosterGroupDLineComponent } from '../position-groups/roster-group-d-line.component';
import { RosterGroupLbComponent } from '../position-groups/roster-group-lb.component';
import { RosterGroupOLineComponent } from '../position-groups/roster-group-o-line.component';
import { RosterGroupQbWrComponent } from '../position-groups/roster-group-qb-wr.component';

type StarterType = 'offense' | 'defense';

interface OffenseGroups {
  qbWr: PlayerMatchWithDetails[];
  oLine: PlayerMatchWithDetails[];
  backs: PlayerMatchWithDetails[];
}

interface DefenseGroups {
  dLine: PlayerMatchWithDetails[];
  lb: PlayerMatchWithDetails[];
  db: PlayerMatchWithDetails[];
}

interface GroupDefinition {
  key: string;
  label: string;
  tokens: string[];
}

@Component({
  selector: 'app-football-start-roster-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RosterGroupBacksComponent,
    RosterGroupDbComponent,
    RosterGroupDLineComponent,
    RosterGroupLbComponent,
    RosterGroupOLineComponent,
    RosterGroupQbWrComponent,
  ],
  templateUrl: './football-start-roster-display.component.html',
  styleUrl: './football-start-roster-display.component.less',
  animations: [slideInLeftAnimation, slideInRightAnimation, rosterGroupStaggerAnimation],
})
export class FootballStartRosterDisplayComponent {
  players = input<PlayerMatchWithDetails[]>([]);
  scoreboard = input<Scoreboard | null>(null);
  teams = input<{ team_a: Team; team_b: Team } | null>(null);

  protected readonly showHomeOffense = computed(() => this.scoreboard()?.is_team_a_start_offense ?? false);
  protected readonly showAwayOffense = computed(() => this.scoreboard()?.is_team_b_start_offense ?? false);
  protected readonly showHomeDefense = computed(() => this.scoreboard()?.is_team_a_start_defense ?? false);
  protected readonly showAwayDefense = computed(() => this.scoreboard()?.is_team_b_start_defense ?? false);

  protected readonly teamAColor = computed(() => this.resolveTeamColor('a'));
  protected readonly teamBColor = computed(() => this.resolveTeamColor('b'));

  protected readonly homeOffenseGroups = computed(() => this.buildOffenseGroups(this.teamStarters('a', 'offense')));
  protected readonly awayOffenseGroups = computed(() => this.buildOffenseGroups(this.teamStarters('b', 'offense')));
  protected readonly homeDefenseGroups = computed(() => this.buildDefenseGroups(this.teamStarters('a', 'defense')));
  protected readonly awayDefenseGroups = computed(() => this.buildDefenseGroups(this.teamStarters('b', 'defense')));

  protected readonly homeOffenseGroupCount = computed(() => this.countOffenseGroups(this.homeOffenseGroups()));
  protected readonly awayOffenseGroupCount = computed(() => this.countOffenseGroups(this.awayOffenseGroups()));
  protected readonly homeDefenseGroupCount = computed(() => this.countDefenseGroups(this.homeDefenseGroups()));
  protected readonly awayDefenseGroupCount = computed(() => this.countDefenseGroups(this.awayDefenseGroups()));

  private readonly offenseGroups: GroupDefinition[] = [
    {
      key: 'qbWr',
      label: 'QB/WR/TE',
      tokens: ['qb', 'quarterback', 'wr', 'wide receiver', 'te', 'tight end'],
    },
    {
      key: 'oLine',
      label: 'O-Line',
      tokens: ['offensive line', 'o line', 'center', 'guard', 'tackle'],
    },
    {
      key: 'backs',
      label: 'Backs',
      tokens: ['rb', 'running back', 'fb', 'fullback', 'hb', 'halfback', 'tailback'],
    },
  ];

  private readonly defenseGroups: GroupDefinition[] = [
    {
      key: 'dLine',
      label: 'D-Line',
      tokens: ['defensive line', 'd line', 'dl', 'defensive end', 'defensive tackle', 'de', 'dt', 'nt', 'nose'],
    },
    {
      key: 'lb',
      label: 'LB',
      tokens: ['linebacker', 'lb', 'mlb', 'olb', 'ilb', 'wil'],
    },
    {
      key: 'db',
      label: 'DB',
      tokens: ['db', 'defensive back', 'corner', 'cornerback', 'safety', 'cb', 'fs', 'ss'],
    },
  ];

  private resolveTeamColor(team: 'a' | 'b'): string {
    const scoreboard = this.scoreboard();
    const teams = this.teams();
    const fallback = '#1a1a1a';

    if (team === 'a') {
      if (scoreboard?.use_team_a_game_color) {
        return scoreboard.team_a_game_color ?? fallback;
      }

      return teams?.team_a?.team_color || scoreboard?.team_a_game_color || fallback;
    }

    if (scoreboard?.use_team_b_game_color) {
      return scoreboard.team_b_game_color ?? fallback;
    }

    return teams?.team_b?.team_color || scoreboard?.team_b_game_color || fallback;
  }

  private teamStarters(team: 'a' | 'b', type: StarterType): PlayerMatchWithDetails[] {
    const teamId = team === 'a' ? this.teams()?.team_a?.id : this.teams()?.team_b?.id;
    if (!teamId) {
      return [];
    }

    return this.sortPlayers(
      this.players().filter((player) => {
        if (player.team_id !== teamId) {
          return false;
        }

        const isStarting = player.is_starting ?? player.is_start ?? false;
        if (!isStarting) {
          return false;
        }

        const starterType = (player.starting_type ?? 'offense').toLowerCase();

        return starterType === type;
      })
    );
  }

  private buildOffenseGroups(players: PlayerMatchWithDetails[]): OffenseGroups {
    const groups = this.buildGroups(players, this.offenseGroups);

    return {
      qbWr: groups.get('qbWr') ?? [],
      oLine: groups.get('oLine') ?? [],
      backs: groups.get('backs') ?? [],
    };
  }

  private buildDefenseGroups(players: PlayerMatchWithDetails[]): DefenseGroups {
    const groups = this.buildGroups(players, this.defenseGroups);

    return {
      dLine: groups.get('dLine') ?? [],
      lb: groups.get('lb') ?? [],
      db: groups.get('db') ?? [],
    };
  }

  private buildGroups(
    players: PlayerMatchWithDetails[],
    definitions: GroupDefinition[]
  ): Map<string, PlayerMatchWithDetails[]> {
    const grouped = new Map<string, PlayerMatchWithDetails[]>();
    definitions.forEach((definition) => grouped.set(definition.key, []));

    players.forEach((player) => {
      const normalized = this.normalizePosition(player);
      const group = definitions.find((definition) => this.matchesTokens(normalized, definition.tokens));
      const fallback = definitions[definitions.length - 1];
      const key = group?.key ?? fallback.key;

      grouped.get(key)?.push(player);
    });

    definitions.forEach((definition) => {
      const current = grouped.get(definition.key) ?? [];
      grouped.set(definition.key, this.sortPlayers(current));
    });

    return grouped;
  }

  private normalizePosition(player: PlayerMatchWithDetails): string {
    const title = player.position?.title ?? '';
    const category = player.position?.category ?? '';
    return `${title} ${category}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  private matchesTokens(normalized: string, tokens: string[]): boolean {
    return tokens.some((token) => this.hasToken(normalized, token));
  }

  private hasToken(normalized: string, token: string): boolean {
    if (token.includes(' ')) {
      return normalized.includes(token);
    }

    return new RegExp(`\\b${token}\\b`).test(normalized);
  }

  private countOffenseGroups(groups: OffenseGroups): number {
    return [groups.qbWr, groups.oLine, groups.backs].filter((group) => group.length).length;
  }

  private countDefenseGroups(groups: DefenseGroups): number {
    return [groups.dLine, groups.lb, groups.db].filter((group) => group.length).length;
  }

  private sortPlayers(players: PlayerMatchWithDetails[]): PlayerMatchWithDetails[] {
    return [...players].sort((a, b) => {
      const numberA = a.match_number || a.player_team_tournament?.player_number || '';
      const numberB = b.match_number || b.player_team_tournament?.player_number || '';

      if (numberA !== numberB) {
        return numberA.localeCompare(numberB, undefined, { numeric: true });
      }

      const nameA = this.getPlayerName(a);
      const nameB = this.getPlayerName(b);

      return nameA.localeCompare(nameB);
    });
  }

  private getPlayerName(player: PlayerMatchWithDetails): string {
    if (player.person) {
      return `${player.person.first_name} ${player.person.second_name}`.trim();
    }

    return `Player ${player.id}`;
  }
}
