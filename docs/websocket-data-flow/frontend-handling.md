# Frontend Handling

## WebSocket Service Signals

Location: `src/app/core/services/websocket.service.ts`

Signals for full data:

```typescript
// Main comprehensive data (set on initial-load)
readonly matchData = signal<ComprehensiveMatchData | null>(null);

// Separate clock signals (updated for predictor sync)
readonly gameClock = signal<GameClock | null>(null);
readonly playClock = signal<PlayClock | null>(null);

// Events and stats
readonly events = signal<FootballEvent[]>([]);
readonly statistics = signal<MatchStats | null>(null);
```

Signals for partial updates:

```typescript
// Partial update signals (updated on subsequent messages)
readonly matchDataPartial = signal<MatchData | null>(null);
readonly scoreboardPartial = signal<unknown | null>(null);
readonly matchPartial = signal<MatchWithDetails | null>(null);
readonly teamsPartial = signal<{team_a: Team; team_b: Team} | null>(null);
readonly playersPartial = signal<PlayerMatchWithDetails[] | null>(null);
readonly eventsPartial = signal<FootballEvent[] | null>(null);

// Last update timestamps
readonly lastMatchDataUpdate = signal<number | null>(null);
readonly lastMatchUpdate = signal<number | null>(null);
readonly lastTeamsUpdate = signal<number | null>(null);
readonly lastPlayersUpdate = signal<number | null>(null);
readonly lastEventsUpdate = signal<number | null>(null);
```

## Message Handler

Location: `src/app/core/services/websocket-message-handlers.ts`

```typescript
handleMessage(message: WebSocketMessage): void {
  const messageType = message['type'];
  const data = message['data'];

  if (messageType === 'initial-load') {
    this.context.matchData.set(comprehensiveData);
    this.context.gameClock.set(comprehensiveData.gameclock);
    this.context.playClock.set(comprehensiveData.playclock);
    this.context.events.set(comprehensiveData.events);
    this.context.statistics.set(data['statistics']);
  }

  if (messageType === 'message-update' || messageType === 'match-update') {
    if (data['match_data']) {
      this.context.matchDataPartial.set(data['match_data']);
      this.context.lastMatchDataUpdate.set(Date.now());
    }
    if (data['scoreboard_data']) {
      this.context.scoreboardPartial.set(data['scoreboard_data']);
    }
    if (data['match']) {
      this.context.matchPartial.set(data['match']);
      this.context.lastMatchUpdate.set(Date.now());
    }
    if (data['teams_data']) {
      this.context.teamsPartial.set(data['teams_data']);
      this.context.lastTeamsUpdate.set(Date.now());
    }
    if (data['players']) {
      this.context.playersPartial.set(data['players']);
      this.context.lastPlayersUpdate.set(Date.now());
    }
    if (data['events']) {
      this.context.eventsPartial.set(data['events']);
      this.context.lastEventsUpdate.set(Date.now());
    }
  }

  if (messageType === 'gameclock-update') {
    const gameclock = message['gameclock'];
    const merged = this.context.mergeGameClock(gameclock);
    this.context.gameClock.set(merged);
  }

  if (messageType === 'playclock-update') {
    const playclock = message['playclock'];
    const merged = this.context.mergePlayClock(playclock);
    this.context.playClock.set(merged);
  }

  if (messageType === 'event-update') {
    this.handleEventUpdate(message);
  }

  if (messageType === 'statistics-update') {
    this.handleStatisticsUpdate(message);
  }

  if (messageType === 'ping') {
    this.handlePing(message);
  }
}
```

## Facade Effects for Merging

Location: `src/app/features/scoreboard/pages/admin/scoreboard-admin.facade.ts`

```typescript
// Merge match_data updates
private wsMatchDataPartialEffect = effect(() => {
  const partial = this.wsService.matchDataPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    match_data: partial,
  });
});

// Merge scoreboard updates
private wsScoreboardPartialEffect = effect(() => {
  const partial = this.wsService.scoreboardPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  const partialScoreboard = partial as Partial<Scoreboard>;
  const currentScoreboard = (current.scoreboard as Scoreboard | null) ?? this.scoreboard();
  const mergedScoreboard = currentScoreboard
    ? ({ ...currentScoreboard, ...partialScoreboard } as Scoreboard)
    : (partial as Scoreboard);

  this.data.set({
    ...current,
    scoreboard: mergedScoreboard as ComprehensiveMatchData['scoreboard'],
  });

  this.scoreboard.set(mergedScoreboard);
});

// Merge match updates
private wsMatchPartialEffect = effect(() => {
  const partial = this.wsService.matchPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    match: partial,
  });
});

// Merge teams updates
private wsTeamsPartialEffect = effect(() => {
  const partial = this.wsService.teamsPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    teams: partial,
  });
});

// Merge players updates
private wsPlayersFromMatchUpdateEffect = effect(() => {
  const players = this.wsService.playersPartial();
  if (!players) return;

  const current = untracked(() => this.data());
  if (!current) return;

  if (JSON.stringify(current.players) !== JSON.stringify(players)) {
    this.data.set({
      ...current,
      players,
    });
  }
});

// Merge events updates
private wsEventsFromMatchUpdateEffect = effect(() => {
  const events = this.wsService.eventsPartial();
  if (!events) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    events,
  });
});
```

Note: `scoreboard_data` updates can be partial. The facade merges incoming scoreboard patches with the current scoreboard state to avoid dropping fields that are not present in every message (for example preset-derived UI metadata).

## Related Documentation

- [Initial Load](./initial-load.md)
- [Update Flow](./update-flow.md)
- [WebSocket Service Pattern](../service-patterns/websocket-service-pattern.md)
