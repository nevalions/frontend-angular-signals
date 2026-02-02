import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClockPredictor } from './clock-predictor';

describe('ClockPredictor', () => {
  let onTickMock: ReturnType<typeof vi.fn>;
  let onTick: (value: number) => void;
  let predictor: ClockPredictor;

  beforeEach(() => {
    onTickMock = vi.fn();
    onTick = onTickMock as unknown as (value: number) => void;
    predictor = new ClockPredictor(onTick);
  });

  afterEach(() => {
    predictor.destroy();
  });

  describe('sync', () => {
    it('should emit frozen value when status is stopped', () => {
      predictor.sync({
        gameclock: 40,
        gameclock_max: 40,
        started_at_ms: null,
        server_time_ms: null,
        status: 'stopped',
      });

      expect(onTickMock).toHaveBeenCalledWith(40);
    });

    it('should start prediction when status is running and started_at_ms is set', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 40,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      expect(onTickMock).toHaveBeenCalledWith(40);
    });

    it('should stop prediction when status changes from running to stopped', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 40,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      predictor.sync({
        gameclock: 38,
        gameclock_max: 40,
        started_at_ms: null,
        server_time_ms: null,
        status: 'stopped',
      });

      expect(onTickMock).toHaveBeenCalledWith(38);
    });
  });

  describe('auto-stop when reaching 0', () => {
    it('should auto-stop when predicted value reaches 0', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 1,
        gameclock_max: 40,
        started_at_ms: now - 1000,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      expect(onTickMock).toHaveBeenCalledWith(0);
    });

    it('should handle reaching 0 from initial value', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 0,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      expect(onTickMock).toHaveBeenCalledWith(0);
    });

    it('should auto-stop after reaching 0 from running state', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 2,
        gameclock_max: 40,
        started_at_ms: now - 2000,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      expect(onTickMock).toHaveBeenCalledWith(0);
    });

    it('should not auto-stop when status is manually set to stopped before reaching 0', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 5,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      predictor.sync({
        gameclock: 5,
        gameclock_max: 40,
        started_at_ms: null,
        server_time_ms: null,
        status: 'stopped',
      });

      expect(onTickMock).toHaveBeenLastCalledWith(5);
    });
  });

  describe('destroy', () => {
    it('should stop prediction when destroyed', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 40,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'running',
        rttMs: 100,
      });

      const tickCountBefore = onTickMock.mock.calls.length;

      predictor.destroy();

      const tickCountAfter = onTickMock.mock.calls.length;

      expect(tickCountAfter).toBe(tickCountBefore);
    });
  });

  describe('edge cases', () => {
    it('should handle null server_time_ms gracefully', () => {
      predictor.sync({
        gameclock: 30,
        gameclock_max: 40,
        started_at_ms: null,
        server_time_ms: null,
        status: 'stopped',
      });

      expect(onTickMock).toHaveBeenCalledWith(30);
    });

    it('should handle custom rttMs value', () => {
      const now = Date.now();

      predictor.sync({
        gameclock: 30,
        gameclock_max: 40,
        started_at_ms: now,
        server_time_ms: now,
        status: 'stopped',
        rttMs: 250,
      });

      expect(onTickMock).toHaveBeenCalledWith(30);
    });
  });
});
