import { describe, it, expect } from 'vitest';
import { GameClock, GameClockCreate, GameClockUpdate } from './gameclock.model';

describe('GameClock Model', () => {
  describe('GameClock interface', () => {
    it('should create a valid gameclock object', () => {
      const gameclock: GameClock = {
        id: 1,
        gameclock: 720,
        gameclock_max: 720,
        gameclock_status: 'running',
        gameclock_time_remaining: 700,
        updated_at: '2024-01-01T00:00:00Z',
        version: 1,
        match_id: 1,
        started_at_ms: 1234567890,
        server_time_ms: 1234567890,
      };

      expect(gameclock.id).toBe(1);
      expect(gameclock.gameclock).toBe(720);
      expect(gameclock.gameclock_max).toBe(720);
      expect(gameclock.gameclock_status).toBe('running');
      expect(gameclock.gameclock_time_remaining).toBe(700);
      expect(gameclock.server_time_ms).toBe(1234567890);
      expect(gameclock.started_at_ms).toBe(1234567890);
    });

    it('should allow null gameclock_time_remaining', () => {
      const gameclock: GameClock = {
        id: 1,
        gameclock: 720,
        gameclock_status: 'stopped',
        match_id: 1,
        gameclock_time_remaining: null,
        server_time_ms: null,
      };

      expect(gameclock.gameclock_time_remaining).toBeNull();
      expect(gameclock.gameclock_status).toBe('stopped');
    });

    it('should allow null started_at_ms', () => {
      const gameclock: GameClock = {
        id: 1,
        gameclock: 720,
        gameclock_status: 'paused',
        match_id: 1,
        started_at_ms: null,
        server_time_ms: null,
      };

      expect(gameclock.started_at_ms).toBeNull();
    });
  });

  describe('GameClockCreate interface', () => {
    it('should create a valid gameclock create object', () => {
      const gameclockCreate: GameClockCreate = {
        gameclock: 720,
        gameclock_max: 720,
        gameclock_status: 'running',
        match_id: 1,
      };

      expect(gameclockCreate.gameclock).toBe(720);
      expect(gameclockCreate.gameclock_max).toBe(720);
      expect(gameclockCreate.gameclock_status).toBe('running');
      expect(gameclockCreate.match_id).toBe(1);
    });
  });

  describe('GameClockUpdate interface', () => {
    it('should create a valid gameclock update object with server_time_ms', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock: 700,
        gameclock_status: 'running',
        server_time_ms: 1234567890,
      };

      expect(gameclockUpdate.gameclock).toBe(700);
      expect(gameclockUpdate.gameclock_status).toBe('running');
      expect(gameclockUpdate.server_time_ms).toBe(1234567890);
    });

    it('should allow update with started_at_ms', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock: 700,
        started_at_ms: 1234567890,
      };

      expect(gameclockUpdate.gameclock).toBe(700);
      expect(gameclockUpdate.started_at_ms).toBe(1234567890);
    });

    it('should allow null server_time_ms', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock: 700,
        server_time_ms: null,
      };

      expect(gameclockUpdate.server_time_ms).toBeNull();
    });

    it('should allow null started_at_ms', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock: 700,
        started_at_ms: null,
      };

      expect(gameclockUpdate.started_at_ms).toBeNull();
    });

    it('should allow undefined properties', () => {
      const gameclockUpdate: GameClockUpdate = {};

      expect(gameclockUpdate.gameclock).toBeUndefined();
      expect(gameclockUpdate.gameclock_status).toBeUndefined();
      expect(gameclockUpdate.server_time_ms).toBeUndefined();
      expect(gameclockUpdate.started_at_ms).toBeUndefined();
    });

    it('should allow partial updates', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock_status: 'paused',
      };

      expect(gameclockUpdate.gameclock_status).toBe('paused');
      expect(gameclockUpdate.gameclock).toBeUndefined();
    });

    it('should allow updating gameclock_max', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock_max: 900,
      };

      expect(gameclockUpdate.gameclock_max).toBe(900);
    });

    it('should allow updating gameclock_time_remaining', () => {
      const gameclockUpdate: GameClockUpdate = {
        gameclock_time_remaining: 650,
      };

      expect(gameclockUpdate.gameclock_time_remaining).toBe(650);
    });
  });
});
