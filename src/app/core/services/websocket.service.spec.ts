import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WebSocketService, ConnectionState, ComprehensiveMatchData } from './websocket.service';
import { GameClock } from '../../features/matches/models/gameclock.model';
import { PlayClock } from '../../features/matches/models/playclock.model';

// Mock webSocket from rxjs/webSocket
vi.mock('rxjs/webSocket', () => ({
  webSocket: vi.fn(),
}));

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with disconnected state', () => {
      expect(service.connectionState()).toBe('disconnected');
    });

    it('should initialize with null matchData', () => {
      expect(service.matchData()).toBeNull();
    });

    it('should initialize with null gameClock', () => {
      expect(service.gameClock()).toBeNull();
    });

    it('should initialize with null playClock', () => {
      expect(service.playClock()).toBeNull();
    });

    it('should initialize with null lastError', () => {
      expect(service.lastError()).toBeNull();
    });
  });

  describe('Signal Types', () => {
    it('should have connectionState signal of correct type', () => {
      expect(typeof service.connectionState).toBe('function');
      const state: ConnectionState = service.connectionState();
      expect(['disconnected', 'connecting', 'connected', 'error']).toContain(state);
    });

    it('should have matchData signal of correct type', () => {
      expect(typeof service.matchData).toBe('function');
      const data: ComprehensiveMatchData | null = service.matchData();
      expect(data).toBeNull();
    });

    it('should have gameClock signal of correct type', () => {
      expect(typeof service.gameClock).toBe('function');
      const clock: GameClock | null = service.gameClock();
      expect(clock).toBeNull();
    });

    it('should have playClock signal of correct type', () => {
      expect(typeof service.playClock).toBe('function');
      const clock: PlayClock | null = service.playClock();
      expect(clock).toBeNull();
    });
  });

  describe('Public Methods', () => {
    it('should have connect method', () => {
      expect(service.connect).toBeDefined();
      expect(typeof service.connect).toBe('function');
    });

    it('should have disconnect method', () => {
      expect(service.disconnect).toBeDefined();
      expect(typeof service.disconnect).toBe('function');
    });

    it('should have sendMessage method', () => {
      expect(service.sendMessage).toBeDefined();
      expect(typeof service.sendMessage).toBe('function');
    });

    it('should have resetData method', () => {
      expect(service.resetData).toBeDefined();
      expect(typeof service.resetData).toBe('function');
    });
  });

  describe('resetData', () => {
    it('should reset all data signals to null', () => {
      // Manually set some values first (using internal access for testing)
      service.resetData();

      expect(service.matchData()).toBeNull();
      expect(service.gameClock()).toBeNull();
      expect(service.playClock()).toBeNull();
    });
  });

  describe('sendMessage without connection', () => {
    it('should warn when sending message without connection', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      service.sendMessage({ type: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocket] Cannot send message - not connected'
      );
    });
  });

  describe('disconnect', () => {
    it('should set connectionState to disconnected', () => {
      service.disconnect();
      expect(service.connectionState()).toBe('disconnected');
    });

    it('should log disconnection', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      service.disconnect();

      expect(consoleSpy).toHaveBeenCalledWith('[WebSocket] Disconnecting');
    });
  });

  describe('Connection Health', () => {
    it('should have lastPingReceived signal', () => {
      expect(service.lastPingReceived).toBeDefined();
      expect(typeof service.lastPingReceived).toBe('function');
    });

    it('should have connectionHealthy computed signal', () => {
      expect(service.connectionHealthy).toBeDefined();
      expect(typeof service.connectionHealthy).toBe('function');
    });

    it('should be healthy when no ping received yet', () => {
      expect(service.lastPingReceived()).toBeNull();
      expect(service.connectionHealthy()).toBe(true);
    });

    it('should be healthy when ping received recently', () => {
      const recentTime = Date.now() - 30000;
      service.lastPingReceived.set(recentTime);
      expect(service.connectionHealthy()).toBe(true);
    });

    it('should be unhealthy when ping received long ago', () => {
      const oldTime = Date.now() - 70000;
      service.lastPingReceived.set(oldTime);
      expect(service.connectionHealthy()).toBe(false);
    });
  });

  describe('Ping/Pong Handling', () => {
    it('should respond to ping with pong containing same timestamp', () => {
      const testTimestamp = 1706000000.123;
      const pingMessage = {
        type: 'ping',
        timestamp: testTimestamp,
      };

      const sendMessageSpy = vi.spyOn(service, 'sendMessage').mockImplementation(() => {});
      const lastPingSpy = vi.spyOn(service.lastPingReceived, 'set');

      service['handlePing'](pingMessage);

      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: 'pong',
        timestamp: testTimestamp,
      });
      expect(lastPingSpy).toHaveBeenCalled();
    });

    it('should update lastPingReceived signal when ping received', () => {
      const pingMessage = {
        type: 'ping',
        timestamp: 1706000000.123,
      };

      vi.spyOn(service, 'sendMessage').mockImplementation(() => {});

      service['handlePing'](pingMessage);

      const lastPing = service.lastPingReceived();
      expect(lastPing).not.toBeNull();
      expect(typeof lastPing).toBe('number');
      expect(lastPing).toBeLessThanOrEqual(Date.now());
    });

    it('should log ping reception', () => {
      const pingMessage = {
        type: 'ping',
        timestamp: 1706000000.123,
      };

      const consoleLogSpy = vi.spyOn(console, 'log');
      vi.spyOn(service, 'sendMessage').mockImplementation(() => {});

      service['handlePing'](pingMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith('[WebSocket] Received ping, sending pong');
    });
  });

  describe('Version-Aware Reconciliation', () => {
    const baseGameClock: GameClock = {
      id: 1,
      match_id: 123,
      gameclock: 600,
      gameclock_max: 720,
      gameclock_status: 'running',
      version: 1,
      updated_at: '2024-01-01T12:00:00Z',
    };

    const basePlayClock: PlayClock = {
      id: 1,
      match_id: 123,
      playclock: 25,
      playclock_max: 40,
      playclock_status: 'running',
      version: 1,
      updated_at: '2024-01-01T12:00:00Z',
    };

    describe('isUpdateNewer', () => {
      it('should return true for newer version', () => {
        const newerUpdate: GameClock = { ...baseGameClock, version: 2 };
        const result = service['isUpdateNewer'](baseGameClock, newerUpdate);
        expect(result).toBe(true);
      });

      it('should return false for older version', () => {
        const olderUpdate: GameClock = { ...baseGameClock, version: 0 };
        const result = service['isUpdateNewer'](baseGameClock, olderUpdate);
        expect(result).toBe(false);
      });

      it('should return false for equal version and timestamp', () => {
        const sameUpdate: GameClock = { ...baseGameClock, version: 1, updated_at: '2024-01-01T12:00:00Z' };
        const result = service['isUpdateNewer'](baseGameClock, sameUpdate);
        expect(result).toBe(false);
      });

      it('should return true for same version but newer timestamp', () => {
        const newerTimestamp: GameClock = { ...baseGameClock, version: 1, updated_at: '2024-01-01T12:01:00Z' };
        const result = service['isUpdateNewer'](baseGameClock, newerTimestamp);
        expect(result).toBe(true);
      });

      it('should return false for same version but older timestamp', () => {
        const olderTimestamp: GameClock = { ...baseGameClock, version: 1, updated_at: '2024-01-01T11:59:00Z' };
        const result = service['isUpdateNewer'](baseGameClock, olderTimestamp);
        expect(result).toBe(false);
      });

      it('should return true when status changes', () => {
        const statusChange: GameClock = {
          ...baseGameClock,
          gameclock_status: 'paused',
          version: 1,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const result = service['isUpdateNewer'](baseGameClock, statusChange);
        expect(result).toBe(true);
      });

      it('should return true for update when no versions exist', () => {
        const noVersionCurrent: GameClock = {
          ...baseGameClock,
          version: null,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const noVersionUpdate: GameClock = {
          ...baseGameClock,
          version: null,
          updated_at: '2024-01-01T12:01:00Z',
        };
        const result = service['isUpdateNewer'](noVersionCurrent, noVersionUpdate);
        expect(result).toBe(true);
      });

      it('should return true when current has no timestamp', () => {
        const noTimestampCurrent: GameClock = {
          ...baseGameClock,
          updated_at: null,
        };
        const withTimestampUpdate: GameClock = {
          ...baseGameClock,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const result = service['isUpdateNewer'](noTimestampCurrent, withTimestampUpdate);
        expect(result).toBe(true);
      });

      it('should return false when update has no timestamp', () => {
        const withTimestampCurrent: GameClock = {
          ...baseGameClock,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const noTimestampUpdate: GameClock = {
          ...baseGameClock,
          updated_at: null,
        };
        const result = service['isUpdateNewer'](withTimestampCurrent, noTimestampUpdate);
        expect(result).toBe(false);
      });

      it('should return true for PlayClock with newer version', () => {
        const newerUpdate: PlayClock = { ...basePlayClock, version: 2 };
        const result = service['isUpdateNewer'](basePlayClock, newerUpdate);
        expect(result).toBe(true);
      });
    });

    describe('mergeGameClock', () => {
      it('should return update when no current exists', () => {
        const update: GameClock = { ...baseGameClock };
        const result = service['mergeGameClock'](update);
        expect(result).toEqual(update);
      });

      it('should merge newer version update', () => {
        service['gameClock'].set({ ...baseGameClock });
        const newerUpdate: GameClock = {
          ...baseGameClock,
          version: 2,
          gameclock: 550,
        };
        const result = service['mergeGameClock'](newerUpdate);
        expect(result.version).toBe(2);
        expect(result.gameclock).toBe(550);
        expect(result.id).toBe(baseGameClock.id);
        expect(result.match_id).toBe(baseGameClock.match_id);
      });

      it('should ignore older version update', () => {
        service['gameClock'].set({ ...baseGameClock });
        const olderUpdate: GameClock = {
          ...baseGameClock,
          version: 0,
          gameclock: 500,
        };
        const result = service['mergeGameClock'](olderUpdate);
        expect(result).toEqual(baseGameClock);
        expect(result.gameclock).toBe(600);
      });

      it('should ignore equal version and timestamp update', () => {
        service['gameClock'].set({ ...baseGameClock });
        const sameUpdate: GameClock = {
          ...baseGameClock,
          version: 1,
          updated_at: '2024-01-01T12:00:00Z',
          gameclock: 500,
        };
        const result = service['mergeGameClock'](sameUpdate);
        expect(result).toEqual(baseGameClock);
        expect(result.gameclock).toBe(600);
      });

      it('should merge status change update', () => {
        service['gameClock'].set({ ...baseGameClock });
        const statusChange: GameClock = {
          ...baseGameClock,
          gameclock_status: 'paused',
          version: 1,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const result = service['mergeGameClock'](statusChange);
        expect(result.gameclock_status).toBe('paused');
      });

      it('should preserve id and match_id from update when provided', () => {
        service['gameClock'].set({ ...baseGameClock });
        const updateWithIds: GameClock = {
          ...baseGameClock,
          version: 2,
          id: 2,
          match_id: 456,
        };
        const result = service['mergeGameClock'](updateWithIds);
        expect(result.id).toBe(2);
        expect(result.match_id).toBe(456);
      });
    });

    describe('mergePlayClock', () => {
      it('should return update when no current exists', () => {
        const update: PlayClock = { ...basePlayClock };
        const result = service['mergePlayClock'](update);
        expect(result).toEqual(update);
      });

      it('should merge newer version update', () => {
        service['playClock'].set({ ...basePlayClock });
        const newerUpdate: PlayClock = {
          ...basePlayClock,
          version: 2,
          playclock: 30,
        };
        const result = service['mergePlayClock'](newerUpdate);
        expect(result.version).toBe(2);
        expect(result.playclock).toBe(30);
        expect(result.id).toBe(basePlayClock.id);
        expect(result.match_id).toBe(basePlayClock.match_id);
      });

      it('should ignore older version update', () => {
        service['playClock'].set({ ...basePlayClock });
        const olderUpdate: PlayClock = {
          ...basePlayClock,
          version: 0,
          playclock: 20,
        };
        const result = service['mergePlayClock'](olderUpdate);
        expect(result).toEqual(basePlayClock);
        expect(result.playclock).toBe(25);
      });

      it('should ignore equal version and timestamp update', () => {
        service['playClock'].set({ ...basePlayClock });
        const sameUpdate: PlayClock = {
          ...basePlayClock,
          version: 1,
          updated_at: '2024-01-01T12:00:00Z',
          playclock: 20,
        };
        const result = service['mergePlayClock'](sameUpdate);
        expect(result).toEqual(basePlayClock);
        expect(result.playclock).toBe(25);
      });

      it('should merge status change update', () => {
        service['playClock'].set({ ...basePlayClock });
        const statusChange: PlayClock = {
          ...basePlayClock,
          playclock_status: 'paused',
          version: 1,
          updated_at: '2024-01-01T12:00:00Z',
        };
        const result = service['mergePlayClock'](statusChange);
        expect(result.playclock_status).toBe('paused');
      });

      it('should preserve id and match_id from update when provided', () => {
        service['playClock'].set({ ...basePlayClock });
        const updateWithIds: PlayClock = {
          ...basePlayClock,
          version: 2,
          id: 2,
          match_id: 456,
        };
        const result = service['mergePlayClock'](updateWithIds);
        expect(result.id).toBe(2);
        expect(result.match_id).toBe(456);
      });
    });
  });
});

describe('ConnectionState type', () => {
  it('should include all valid states', () => {
    const states: ConnectionState[] = ['disconnected', 'connecting', 'connected', 'error'];
    expect(states).toHaveLength(4);
  });
});

describe('ComprehensiveMatchData interface', () => {
  it('should accept valid ComprehensiveMatchData object', () => {
    const matchData: ComprehensiveMatchData = {
      match_data: {
        id: 1,
        match_id: 123,
        score_team_a: 7,
        score_team_b: 14,
      },
      gameclock: {
        id: 1,
        match_id: 123,
        gameclock: 720,
        gameclock_max: 900,
        gameclock_status: 'running',
      },
      playclock: {
        id: 1,
        match_id: 123,
        playclock: 25,
        playclock_status: 'running',
      },
    };

    expect(matchData.match_data?.id).toBe(1);
    expect(matchData.gameclock?.gameclock).toBe(720);
    expect(matchData.playclock?.playclock).toBe(25);
  });

  it('should accept ComprehensiveMatchData with optional fields', () => {
    const matchData: ComprehensiveMatchData = {};
    expect(matchData.match_data).toBeUndefined();
    expect(matchData.gameclock).toBeUndefined();
    expect(matchData.playclock).toBeUndefined();
  });

  it('should accept ComprehensiveMatchData with additional properties', () => {
    const matchData: ComprehensiveMatchData = {
      custom_field: 'test value',
      another_field: 123,
    };
    expect(matchData['custom_field']).toBe('test value');
    expect(matchData['another_field']).toBe(123);
  });
});
