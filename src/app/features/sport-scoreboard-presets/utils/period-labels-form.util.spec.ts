import { describe, expect, it } from 'vitest';
import {
  hasInvalidCustomPeriodLabelsInput,
  parseCustomPeriodLabelsInput,
  serializeCustomPeriodLabelsInput,
} from './period-labels-form.util';

describe('period labels form utils', () => {
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
});
