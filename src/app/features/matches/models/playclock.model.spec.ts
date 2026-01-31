import { describe, it, expect } from 'vitest';
import { PlayClock, PlayClockCreate, PlayClockUpdate } from './playclock.model';

const buildPlayClock = (overrides: Partial<PlayClock> = {}): PlayClock => ({
  id: 1,
  playclock: 25,
  playclock_max: 40,
  playclock_status: 'running',
  updated_at: '2024-01-01T00:00:00Z',
  version: 1,
  match_id: 1,
  started_at_ms: 1234567890,
  server_time_ms: 1234567890,
  ...overrides,
});

const buildPlayClockCreate = (
  overrides: Partial<PlayClockCreate> = {},
): PlayClockCreate => ({
  playclock: 25,
  playclock_status: 'running',
  match_id: 1,
  ...overrides,
});

const buildPlayClockUpdate = (overrides: PlayClockUpdate = {}): PlayClockUpdate => ({
  ...overrides,
});

describe('PlayClock Model', () => {
  describe('PlayClock interface', () => {
    it('should create a valid playclock object', () => {
      const playclock = buildPlayClock();

      expect(playclock.id).toBe(1);
      expect(playclock.playclock).toBe(25);
      expect(playclock.playclock_max).toBe(40);
      expect(playclock.playclock_status).toBe('running');
      expect(playclock.server_time_ms).toBe(1234567890);
      expect(playclock.started_at_ms).toBe(1234567890);
    });

    it('should allow null playclock', () => {
      const playclock = buildPlayClock({
        playclock: null,
        playclock_status: 'stopped',
        server_time_ms: null,
      });

      expect(playclock.playclock).toBeNull();
      expect(playclock.playclock_status).toBe('stopped');
    });

    it('should allow null started_at_ms', () => {
      const playclock = buildPlayClock({
        playclock_status: 'paused',
        started_at_ms: null,
        server_time_ms: null,
      });

      expect(playclock.started_at_ms).toBeNull();
    });
  });

  describe('PlayClockCreate interface', () => {
    it('should create a valid playclock create object', () => {
      const playclockCreate = buildPlayClockCreate();

      expect(playclockCreate.playclock).toBe(25);
      expect(playclockCreate.playclock_status).toBe('running');
      expect(playclockCreate.match_id).toBe(1);
    });
  });

  describe('PlayClockUpdate interface', () => {
    const updateCases = [
      {
        name: 'should create a valid playclock update object with server_time_ms',
        update: buildPlayClockUpdate({
          playclock: 30,
          playclock_status: 'running',
          server_time_ms: 1234567890,
        }),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.playclock).toBe(30);
          expect(playclockUpdate.playclock_status).toBe('running');
          expect(playclockUpdate.server_time_ms).toBe(1234567890);
        },
      },
      {
        name: 'should allow update with started_at_ms',
        update: buildPlayClockUpdate({
          playclock: 25,
          started_at_ms: 1234567890,
        }),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.playclock).toBe(25);
          expect(playclockUpdate.started_at_ms).toBe(1234567890);
        },
      },
      {
        name: 'should allow null server_time_ms',
        update: buildPlayClockUpdate({
          playclock: 25,
          server_time_ms: null,
        }),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.server_time_ms).toBeNull();
        },
      },
      {
        name: 'should allow null started_at_ms',
        update: buildPlayClockUpdate({
          playclock: 25,
          started_at_ms: null,
        }),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.started_at_ms).toBeNull();
        },
      },
      {
        name: 'should allow undefined properties',
        update: buildPlayClockUpdate(),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.playclock).toBeUndefined();
          expect(playclockUpdate.playclock_status).toBeUndefined();
          expect(playclockUpdate.server_time_ms).toBeUndefined();
          expect(playclockUpdate.started_at_ms).toBeUndefined();
        },
      },
      {
        name: 'should allow partial updates',
        update: buildPlayClockUpdate({
          playclock_status: 'paused',
        }),
        assert: (playclockUpdate: PlayClockUpdate) => {
          expect(playclockUpdate.playclock_status).toBe('paused');
          expect(playclockUpdate.playclock).toBeUndefined();
        },
      },
    ];

    updateCases.forEach(({ name, update, assert }) => {
      it(name, () => {
        assert(update);
      });
    });
  });
});
