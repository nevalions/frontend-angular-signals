import { describe, expect, it } from 'vitest';
import { GameClock } from '../../matches/models/gameclock.model';
import { normalizeIncomingUpClockStopSnapshot } from './scoreboard-clock.service';

function createGameClock(overrides: Partial<GameClock> = {}): GameClock {
  return {
    id: 1,
    match_id: 10,
    gameclock: 0,
    gameclock_max: 2700,
    gameclock_status: 'stopped',
    direction: 'down',
    version: 1,
    ...overrides,
  };
}

describe('normalizeIncomingUpClockStopSnapshot', () => {
  it('normalizes invalid up-clock stop snapshot at zero to max', () => {
    const current = createGameClock({
      direction: 'up',
      gameclock_status: 'running',
      gameclock: 2700,
      gameclock_max: 2700,
    });

    const incoming = createGameClock({
      direction: 'up',
      gameclock_status: 'stopped',
      gameclock: 0,
      gameclock_max: 2700,
    });

    const normalized = normalizeIncomingUpClockStopSnapshot(current, incoming);

    expect(normalized.gameclock).toBe(2700);
  });

  it('keeps valid down-clock stop snapshot at zero unchanged', () => {
    const current = createGameClock({
      direction: 'down',
      gameclock_status: 'running',
      gameclock: 1,
      gameclock_max: 2700,
    });

    const incoming = createGameClock({
      direction: 'down',
      gameclock_status: 'stopped',
      gameclock: 0,
      gameclock_max: 2700,
    });

    const normalized = normalizeIncomingUpClockStopSnapshot(current, incoming);

    expect(normalized.gameclock).toBe(0);
  });

  it('normalizes invalid up-clock terminal rewind snapshot to max', () => {
    const current = createGameClock({
      direction: 'up',
      gameclock_status: 'running',
      gameclock: 2699,
      gameclock_max: 2700,
    });

    const incoming = createGameClock({
      direction: 'up',
      gameclock_status: 'stopped',
      gameclock: 2698,
      gameclock_max: 2700,
    });

    const normalized = normalizeIncomingUpClockStopSnapshot(current, incoming);

    expect(normalized.gameclock).toBe(2700);
  });

  it('does not normalize when up-clock is not near max before stopping', () => {
    const current = createGameClock({
      direction: 'up',
      gameclock_status: 'running',
      gameclock: 1200,
      gameclock_max: 2700,
    });

    const incoming = createGameClock({
      direction: 'up',
      gameclock_status: 'stopped',
      gameclock: 0,
      gameclock_max: 2700,
    });

    const normalized = normalizeIncomingUpClockStopSnapshot(current, incoming);

    expect(normalized.gameclock).toBe(0);
  });
});
