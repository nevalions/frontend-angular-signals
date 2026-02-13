import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GameClock } from '../../matches/models/gameclock.model';
import { normalizeIncomingUpClockStopSnapshot, ScoreboardClockService } from './scoreboard-clock.service';
import { ScoreboardStoreService } from './scoreboard-store.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { of, Subject } from 'rxjs';

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

describe('ScoreboardClockService - resetGameClock regression tests', () => {
  let service: ScoreboardClockService;
  let storeMock: { resetGameClockPeriodAware: ReturnType<typeof vi.fn> };
  let wsMock: { gameClock: ReturnType<typeof vi.fn>; playClock: ReturnType<typeof vi.fn>; lastRtt: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storeMock = {
      resetGameClockPeriodAware: vi.fn(),
    };

    wsMock = {
      gameClock: vi.fn(() => null),
      playClock: vi.fn(() => null),
      lastRtt: vi.fn(() => 100),
    };

    TestBed.configureTestingModule({
      providers: [
        ScoreboardClockService,
        { provide: ScoreboardStoreService, useValue: storeMock },
        { provide: WebSocketService, useValue: wsMock },
      ],
    });

    service = TestBed.inject(ScoreboardClockService);
  });

  it('should call resetGameClockPeriodAware without computing seconds locally', () => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 1800,
      gameclock_max: 2700,
      gameclock_status: 'running',
      direction: 'up',
    });
    service.gameClock.set(gameClock);

    const apiResponse = createGameClock({
      id: 42,
      gameclock: 2700,
      gameclock_status: 'stopped',
      direction: 'up',
    });
    storeMock.resetGameClockPeriodAware.mockReturnValue(of(apiResponse));

    service.resetGameClock();

    expect(storeMock.resetGameClockPeriodAware).toHaveBeenCalledWith(42);
    expect(storeMock.resetGameClockPeriodAware).not.toHaveBeenCalledWith(
      42,
      expect.any(Number)
    );
  });

  it('should update local state from API response for cumulative up-clock (2nd half reset)', () => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 2930,
      gameclock_max: 5400,
      gameclock_status: 'running',
      direction: 'up',
    });
    service.gameClock.set(gameClock);

    const apiResponse = createGameClock({
      id: 42,
      gameclock: 2700,
      gameclock_max: 5400,
      gameclock_status: 'stopped',
      direction: 'up',
    });
    storeMock.resetGameClockPeriodAware.mockReturnValue(of(apiResponse));

    service.resetGameClock();

    const updated = service.gameClock();
    expect(updated?.gameclock).toBe(2700);
    expect(updated?.gameclock_status).toBe('stopped');
  });

  it('should use backend-derived reset value, not hardcoded zero', () => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 1800,
      gameclock_max: 2700,
      gameclock_status: 'running',
      direction: 'down',
    });
    service.gameClock.set(gameClock);

    const apiResponse = createGameClock({
      id: 42,
      gameclock: 2700,
      gameclock_status: 'stopped',
      direction: 'down',
    });
    storeMock.resetGameClockPeriodAware.mockReturnValue(of(apiResponse));

    service.resetGameClock();

    const updated = service.gameClock();
    expect(updated?.gameclock).toBe(2700);
  });

  it('should set optimistic status to stopped before API response', () => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 1200,
      gameclock_status: 'running',
      direction: 'down',
    });
    service.gameClock.set(gameClock);

    const responseSubject = new Subject<GameClock>();
    storeMock.resetGameClockPeriodAware.mockReturnValue(responseSubject.asObservable());

    service.resetGameClock();

    const optimistic = service.gameClock();
    expect(optimistic?.gameclock_status).toBe('stopped');
  });

  it('should preserve gameclock_max from API response', () => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 2800,
      gameclock_max: 2700,
      gameclock_status: 'running',
      direction: 'up',
    });
    service.gameClock.set(gameClock);

    const apiResponse = createGameClock({
      id: 42,
      gameclock: 2700,
      gameclock_max: 5400,
      gameclock_status: 'stopped',
      direction: 'up',
    });
    storeMock.resetGameClockPeriodAware.mockReturnValue(of(apiResponse));

    service.resetGameClock();

    const updated = service.gameClock();
    expect(updated?.gameclock_max).toBe(5400);
  });

  it('should handle error without crashing', fakeAsync(() => {
    const gameClock = createGameClock({
      id: 42,
      gameclock: 1200,
      gameclock_status: 'running',
    });
    service.gameClock.set(gameClock);

    storeMock.resetGameClockPeriodAware.mockReturnValue(
      new Subject<GameClock>().asObservable()
    );

    expect(() => {
      service.resetGameClock();
      tick();
    }).not.toThrow();
  }));
});
