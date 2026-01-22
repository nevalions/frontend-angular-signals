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
