import { describe, expect, it } from 'vitest';
import {
  hasInvalidCustomPeriodLabelsInput,
  parseCustomPeriodLabelsInput,
  parseQuickScoreDeltasInput,
  serializeCustomPeriodLabelsInput,
  serializeQuickScoreDeltasInput,
  validateInitialTimeMinSeconds,
  getQuickScoreDeltasValidationError,
  INITIAL_TIME_MODE_OPTIONS,
  PERIOD_MODE_OPTIONS,
  DEFAULT_QUICK_SCORE_DELTAS,
} from './period-labels-form.util';

describe('period labels form utils', () => {
  describe('INITIAL_TIME_MODE_OPTIONS', () => {
    it('should include all three modes', () => {
      expect(INITIAL_TIME_MODE_OPTIONS).toHaveLength(3);
      const modeValues = INITIAL_TIME_MODE_OPTIONS.map((opt) => opt.value);
      expect(modeValues).toContain('max');
      expect(modeValues).toContain('zero');
      expect(modeValues).toContain('min');
    });
  });

  describe('PERIOD_MODE_OPTIONS', () => {
    it('should include all period modes', () => {
      expect(PERIOD_MODE_OPTIONS).toHaveLength(6);
      const modeValues = PERIOD_MODE_OPTIONS.map((opt) => opt.value);
      expect(modeValues).toContain('qtr');
      expect(modeValues).toContain('period');
      expect(modeValues).toContain('half');
      expect(modeValues).toContain('set');
      expect(modeValues).toContain('inning');
      expect(modeValues).toContain('custom');
    });
  });

  describe('validateInitialTimeMinSeconds', () => {
    it('returns true for max mode regardless of initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('max', null)).toBe(true);
      expect(validateInitialTimeMinSeconds('max', undefined)).toBe(true);
      expect(validateInitialTimeMinSeconds('max', 100)).toBe(true);
      expect(validateInitialTimeMinSeconds('max', 0)).toBe(true);
      expect(validateInitialTimeMinSeconds('max', -1)).toBe(true);
    });

    it('returns true for zero mode regardless of initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('zero', null)).toBe(true);
      expect(validateInitialTimeMinSeconds('zero', undefined)).toBe(true);
      expect(validateInitialTimeMinSeconds('zero', 100)).toBe(true);
      expect(validateInitialTimeMinSeconds('zero', 0)).toBe(true);
      expect(validateInitialTimeMinSeconds('zero', -1)).toBe(true);
    });

    it('returns true for min mode with valid initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('min', 0)).toBe(true);
      expect(validateInitialTimeMinSeconds('min', 1)).toBe(true);
      expect(validateInitialTimeMinSeconds('min', 100)).toBe(true);
      expect(validateInitialTimeMinSeconds('min', 720)).toBe(true);
      expect(validateInitialTimeMinSeconds('min', 900)).toBe(true);
    });

    it('returns false for min mode with null initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('min', null)).toBe(false);
    });

    it('returns false for min mode with undefined initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('min', undefined)).toBe(false);
    });

    it('returns false for min mode with negative initial_time_min_seconds', () => {
      expect(validateInitialTimeMinSeconds('min', -1)).toBe(false);
      expect(validateInitialTimeMinSeconds('min', -100)).toBe(false);
    });

    it('handles undefined initial_time_mode', () => {
      expect(validateInitialTimeMinSeconds(undefined, null)).toBe(true);
      expect(validateInitialTimeMinSeconds(undefined, 100)).toBe(true);
    });

    it('handles null initial_time_mode', () => {
      expect(validateInitialTimeMinSeconds(null, null)).toBe(true);
      expect(validateInitialTimeMinSeconds(null, 100)).toBe(true);
    });
  });
  describe('parseCustomPeriodLabelsInput', () => {
    it('returns null for empty values', () => {
      expect(parseCustomPeriodLabelsInput('')).toBeNull();
      expect(parseCustomPeriodLabelsInput('   ')).toBeNull();
      expect(parseCustomPeriodLabelsInput(null)).toBeNull();
    });

    it('parses comma separated labels', () => {
      expect(parseCustomPeriodLabelsInput('period.leg_1, period.leg_2')).toEqual([
        'period.leg_1',
        'period.leg_2',
      ]);
    });

    it('trims spaces and removes empty parts', () => {
      expect(parseCustomPeriodLabelsInput(' period.set_1 ,, period.set_2 ')).toEqual([
        'period.set_1',
        'period.set_2',
      ]);
    });
  });

  describe('serializeCustomPeriodLabelsInput', () => {
    it('returns empty string for nullish values', () => {
      expect(serializeCustomPeriodLabelsInput(null)).toBe('');
      expect(serializeCustomPeriodLabelsInput(undefined)).toBe('');
      expect(serializeCustomPeriodLabelsInput([])).toBe('');
    });

    it('serializes labels as comma separated string', () => {
      expect(serializeCustomPeriodLabelsInput(['period.leg_1', 'period.leg_2'])).toBe(
        'period.leg_1, period.leg_2',
      );
    });
  });

  describe('hasInvalidCustomPeriodLabelsInput', () => {
    it('returns false for empty input', () => {
      expect(hasInvalidCustomPeriodLabelsInput('')).toBe(false);
    });

    it('returns false for valid machine labels', () => {
      expect(hasInvalidCustomPeriodLabelsInput('period.leg_1,period-leg-2,period_set_3')).toBe(false);
    });

    it('returns true for invalid labels', () => {
      expect(hasInvalidCustomPeriodLabelsInput('Period One, period.leg_2')).toBe(true);
    });
  });

  describe('parseQuickScoreDeltasInput', () => {
    it('returns null for empty values', () => {
      expect(parseQuickScoreDeltasInput('')).toBeNull();
      expect(parseQuickScoreDeltasInput('   ')).toBeNull();
      expect(parseQuickScoreDeltasInput(null)).toBeNull();
    });

    it('parses comma separated integers', () => {
      expect(parseQuickScoreDeltasInput('6,3,2,1,-1')).toEqual([6, 3, 2, 1, -1]);
      expect(parseQuickScoreDeltasInput(' 6, 3, 2 , 1, -1 ')).toEqual([6, 3, 2, 1, -1]);
    });

    it('returns null for non-integer values', () => {
      expect(parseQuickScoreDeltasInput('6,abc,1')).toBeNull();
      expect(parseQuickScoreDeltasInput('6,1.5,-1')).toBeNull();
    });
  });

  describe('serializeQuickScoreDeltasInput', () => {
    it('returns defaults for nullish values', () => {
      expect(serializeQuickScoreDeltasInput(null)).toBe(DEFAULT_QUICK_SCORE_DELTAS.join(','));
      expect(serializeQuickScoreDeltasInput(undefined)).toBe(DEFAULT_QUICK_SCORE_DELTAS.join(','));
      expect(serializeQuickScoreDeltasInput([])).toBe(DEFAULT_QUICK_SCORE_DELTAS.join(','));
    });

    it('serializes quick score deltas', () => {
      expect(serializeQuickScoreDeltasInput([1, -1])).toBe('1,-1');
    });
  });

  describe('getQuickScoreDeltasValidationError', () => {
    it('returns null for valid deltas', () => {
      expect(getQuickScoreDeltasValidationError('6,3,2,1,-1')).toBeNull();
      expect(getQuickScoreDeltasValidationError('1,-1')).toBeNull();
    });

    it('returns an error for invalid input', () => {
      expect(getQuickScoreDeltasValidationError('')).toContain('Enter at least one integer delta');
      expect(getQuickScoreDeltasValidationError('1,0')).toContain('cannot include 0');
      expect(getQuickScoreDeltasValidationError('101')).toContain('between -100 and 100');
      expect(getQuickScoreDeltasValidationError('1,2,3,4,5,6,7,8,9,10,11')).toContain('No more than 10');
      expect(getQuickScoreDeltasValidationError('1,a')).toContain('Enter at least one integer delta');
    });
  });
});
