import { describe, it, expect } from 'vitest';
import { PlayClock, PlayClockCreate, PlayClockUpdate } from './playclock.model';

describe('PlayClock Model', () => {
  describe('PlayClock interface', () => {
    it('should create a valid playclock object', () => {
      const playclock: PlayClock = {
        id: 1,
        playclock: 25,
        playclock_max: 40,
        playclock_status: 'running',
        updated_at: '2024-01-01T00:00:00Z',
        version: 1,
        match_id: 1,
        started_at_ms: 1234567890,
        server_time_ms: 1234567890,
      };

      expect(playclock.id).toBe(1);
      expect(playclock.playclock).toBe(25);
      expect(playclock.playclock_max).toBe(40);
      expect(playclock.playclock_status).toBe('running');
      expect(playclock.server_time_ms).toBe(1234567890);
      expect(playclock.started_at_ms).toBe(1234567890);
    });

    it('should allow null playclock', () => {
      const playclock: PlayClock = {
        id: 1,
        playclock: null,
        playclock_status: 'stopped',
        match_id: 1,
        server_time_ms: null,
      };

      expect(playclock.playclock).toBeNull();
      expect(playclock.playclock_status).toBe('stopped');
    });

    it('should allow null started_at_ms', () => {
      const playclock: PlayClock = {
        id: 1,
        playclock: 25,
        playclock_status: 'paused',
        match_id: 1,
        started_at_ms: null,
        server_time_ms: null,
      };

      expect(playclock.started_at_ms).toBeNull();
    });
  });

  describe('PlayClockCreate interface', () => {
    it('should create a valid playclock create object', () => {
      const playclockCreate: PlayClockCreate = {
        playclock: 25,
        playclock_status: 'running',
        match_id: 1,
      };

      expect(playclockCreate.playclock).toBe(25);
      expect(playclockCreate.playclock_status).toBe('running');
      expect(playclockCreate.match_id).toBe(1);
    });
  });

  describe('PlayClockUpdate interface', () => {
    it('should create a valid playclock update object with server_time_ms', () => {
      const playclockUpdate: PlayClockUpdate = {
        playclock: 30,
        playclock_status: 'running',
        server_time_ms: 1234567890,
      };

      expect(playclockUpdate.playclock).toBe(30);
      expect(playclockUpdate.playclock_status).toBe('running');
      expect(playclockUpdate.server_time_ms).toBe(1234567890);
    });

    it('should allow update with started_at_ms', () => {
      const playclockUpdate: PlayClockUpdate = {
        playclock: 25,
        started_at_ms: 1234567890,
      };

      expect(playclockUpdate.playclock).toBe(25);
      expect(playclockUpdate.started_at_ms).toBe(1234567890);
    });

    it('should allow null server_time_ms', () => {
      const playclockUpdate: PlayClockUpdate = {
        playclock: 25,
        server_time_ms: null,
      };

      expect(playclockUpdate.server_time_ms).toBeNull();
    });

    it('should allow null started_at_ms', () => {
      const playclockUpdate: PlayClockUpdate = {
        playclock: 25,
        started_at_ms: null,
      };

      expect(playclockUpdate.started_at_ms).toBeNull();
    });

    it('should allow undefined properties', () => {
      const playclockUpdate: PlayClockUpdate = {};

      expect(playclockUpdate.playclock).toBeUndefined();
      expect(playclockUpdate.playclock_status).toBeUndefined();
      expect(playclockUpdate.server_time_ms).toBeUndefined();
      expect(playclockUpdate.started_at_ms).toBeUndefined();
    });

    it('should allow partial updates', () => {
      const playclockUpdate: PlayClockUpdate = {
        playclock_status: 'paused',
      };

      expect(playclockUpdate.playclock_status).toBe('paused');
      expect(playclockUpdate.playclock).toBeUndefined();
    });
  });
});
