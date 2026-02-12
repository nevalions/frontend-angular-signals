import { describe, it, expect } from 'vitest';

describe('Gameclock Initial Time Calculation - Regression Tests', () => {
  function calculateInitialGameclockSeconds(
    gameclock_max: number | null,
    initial_time_mode: 'max' | 'zero' | 'min',
    initial_time_min_seconds: number | null,
  ): number {
    let initial_seconds: number;

    if (initial_time_mode === 'zero') {
      initial_seconds = 0;
    } else if (initial_time_mode === 'min') {
      initial_seconds = initial_time_min_seconds || 0;
    } else {
      initial_seconds = gameclock_max || 0;
    }

    if (gameclock_max !== null) {
      return Math.max(0, Math.min(initial_seconds, gameclock_max));
    }

    return Math.max(0, initial_seconds);
  }

  describe('Mode: max', () => {
    it('should use gameclock_max when mode is max', () => {
      expect(calculateInitialGameclockSeconds(720, 'max', null)).toBe(720);
    });

    it('should use gameclock_max when mode is max with non-720 value', () => {
      expect(calculateInitialGameclockSeconds(900, 'max', null)).toBe(900);
    });

    it('should use gameclock_max when mode is max with 600 value', () => {
      expect(calculateInitialGameclockSeconds(600, 'max', null)).toBe(600);
    });

    it('should use gameclock_max when mode is max with 300 value', () => {
      expect(calculateInitialGameclockSeconds(300, 'max', null)).toBe(300);
    });

    it('should return 0 when gameclock_max is null', () => {
      expect(calculateInitialGameclockSeconds(null, 'max', null)).toBe(0);
    });

    it('should ignore initial_time_min_seconds when mode is max', () => {
      expect(calculateInitialGameclockSeconds(720, 'max', 100)).toBe(720);
      expect(calculateInitialGameclockSeconds(720, 'max', 0)).toBe(720);
    });
  });

  describe('Mode: zero', () => {
    it('should return 0 when mode is zero regardless of gameclock_max', () => {
      expect(calculateInitialGameclockSeconds(720, 'zero', null)).toBe(0);
      expect(calculateInitialGameclockSeconds(900, 'zero', null)).toBe(0);
      expect(calculateInitialGameclockSeconds(600, 'zero', null)).toBe(0);
    });

    it('should return 0 when mode is zero regardless of initial_time_min_seconds', () => {
      expect(calculateInitialGameclockSeconds(720, 'zero', 100)).toBe(0);
      expect(calculateInitialGameclockSeconds(720, 'zero', 0)).toBe(0);
    });

    it('should return 0 when mode is zero and gameclock_max is null', () => {
      expect(calculateInitialGameclockSeconds(null, 'zero', null)).toBe(0);
    });
  });

  describe('Mode: min', () => {
    it('should use initial_time_min_seconds when mode is min', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', 300)).toBe(300);
    });

    it('should use initial_time_min_seconds when mode is min with non-720 gameclock_max', () => {
      expect(calculateInitialGameclockSeconds(900, 'min', 400)).toBe(400);
      expect(calculateInitialGameclockSeconds(600, 'min', 200)).toBe(200);
    });

    it('should return 0 when initial_time_min_seconds is null', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', null)).toBe(0);
    });

    it('should return 0 when initial_time_min_seconds is 0', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', 0)).toBe(0);
    });

    it('should cap initial_time_min_seconds to gameclock_max when it exceeds max', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', 1000)).toBe(720);
      expect(calculateInitialGameclockSeconds(600, 'min', 900)).toBe(600);
      expect(calculateInitialGameclockSeconds(300, 'min', 500)).toBe(300);
    });

    it('should allow initial_time_min_seconds equal to gameclock_max', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', 720)).toBe(720);
      expect(calculateInitialGameclockSeconds(900, 'min', 900)).toBe(900);
    });

    it('should allow initial_time_min_seconds less than gameclock_max', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', 719)).toBe(719);
      expect(calculateInitialGameclockSeconds(900, 'min', 500)).toBe(500);
    });

    it('should return initial_time_min_seconds when gameclock_max is null', () => {
      expect(calculateInitialGameclockSeconds(null, 'min', 100)).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative initial_time_min_seconds by capping at 0', () => {
      expect(calculateInitialGameclockSeconds(720, 'min', -100)).toBe(0);
      expect(calculateInitialGameclockSeconds(720, 'max', null)).toBe(720);
    });

    it('should handle very large gameclock_max values', () => {
      expect(calculateInitialGameclockSeconds(9999, 'max', null)).toBe(9999);
      expect(calculateInitialGameclockSeconds(9999, 'min', 5000)).toBe(5000);
    });

    it('should handle very small gameclock_max values', () => {
      expect(calculateInitialGameclockSeconds(1, 'max', null)).toBe(1);
      expect(calculateInitialGameclockSeconds(1, 'min', 100)).toBe(1);
    });

    it('should preserve non-720 gameclock_max values', () => {
      expect(calculateInitialGameclockSeconds(900, 'max', null)).toBe(900);
      expect(calculateInitialGameclockSeconds(600, 'max', null)).toBe(600);
      expect(calculateInitialGameclockSeconds(300, 'max', null)).toBe(300);
      expect(calculateInitialGameclockSeconds(120, 'max', null)).toBe(120);
    });

    it('should preserve non-720 gameclock_max with min mode', () => {
      expect(calculateInitialGameclockSeconds(900, 'min', 300)).toBe(300);
      expect(calculateInitialGameclockSeconds(600, 'min', 200)).toBe(200);
      expect(calculateInitialGameclockSeconds(300, 'min', 100)).toBe(100);
    });

    it('should preserve non-720 gameclock_max with zero mode', () => {
      expect(calculateInitialGameclockSeconds(900, 'zero', null)).toBe(0);
      expect(calculateInitialGameclockSeconds(600, 'zero', null)).toBe(0);
      expect(calculateInitialGameclockSeconds(300, 'zero', null)).toBe(0);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle standard football preset (720 seconds, max mode)', () => {
      expect(calculateInitialGameclockSeconds(720, 'max', null)).toBe(720);
    });

    it('should handle basketball preset (12 minutes = 720 seconds, max mode)', () => {
      expect(calculateInitialGameclockSeconds(720, 'max', null)).toBe(720);
    });

    it('should handle soccer preset (45 minutes = 2700 seconds, max mode)', () => {
      expect(calculateInitialGameclockSeconds(2700, 'max', null)).toBe(2700);
    });

    it('should handle soccer preset with 0 initial time', () => {
      expect(calculateInitialGameclockSeconds(2700, 'zero', null)).toBe(0);
    });

    it('should handle soccer preset with custom initial time (15 minutes = 900 seconds)', () => {
      expect(calculateInitialGameclockSeconds(2700, 'min', 900)).toBe(900);
    });

    it('should handle short preset (2 minutes = 120 seconds, max mode)', () => {
      expect(calculateInitialGameclockSeconds(120, 'max', null)).toBe(120);
    });

    it('should handle very long preset (120 minutes = 7200 seconds, max mode)', () => {
      expect(calculateInitialGameclockSeconds(7200, 'max', null)).toBe(7200);
    });
  });
});
