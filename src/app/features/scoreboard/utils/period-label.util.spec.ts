import { describe, expect, it } from 'vitest';
import {
  formatPeriodLabel,
  getPeriodOptions,
  toCanonicalPeriodKey,
  toLegacyPeriodValue,
} from './period-label.util';

describe('period-label util', () => {
  it('builds canonical period keys from period_count', () => {
    const options = getPeriodOptions('period', true, null, null, 3);

    expect(options).toEqual(['period.1', 'period.2', 'period.3']);
  });

  it('uses custom labels only in custom mode', () => {
    const options = getPeriodOptions('custom', true, ['period.top', 'period.bottom'], null, 2);

    expect(options).toEqual(['period.top', 'period.bottom']);
  });

  it('keeps legacy fallback when canonical fields are missing', () => {
    const options = getPeriodOptions(null, false, null, null, null);

    expect(options).toEqual(['1st', '2nd']);
  });

  it('formats canonical period keys by mode', () => {
    const label = formatPeriodLabel({
      value: 'period.3',
      mode: 'period',
      customLabels: null,
      translateQuarter: (value) => value ?? '',
    });

    expect(label).toBe('P3');
  });

  it('maps canonical keys to legacy quarter strings for compatibility', () => {
    expect(toLegacyPeriodValue('period.1', null)).toBe('1st');
    expect(toCanonicalPeriodKey('2nd', null)).toBe('period.2');
  });
});
