import { SportPeriodMode } from '../../matches/models/scoreboard.model';
import { PeriodClockVariant } from '../models/sport-scoreboard-preset.model';

const MACHINE_LABEL_KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export const PERIOD_MODE_OPTIONS: ReadonlyArray<{ value: SportPeriodMode; label: string }> = [
  { value: 'qtr', label: 'Quarter' },
  { value: 'period', label: 'Period' },
  { value: 'half', label: 'Half' },
  { value: 'set', label: 'Set' },
  { value: 'inning', label: 'Inning' },
  { value: 'custom', label: 'Custom' },
];

export const INITIAL_TIME_MODE_OPTIONS: ReadonlyArray<{ value: 'max' | 'zero' | 'min'; label: string }> = [
  { value: 'max', label: 'Max Time' },
  { value: 'zero', label: 'Zero' },
  { value: 'min', label: 'Custom Min' },
] as const;

export const PERIOD_CLOCK_VARIANT_OPTIONS: ReadonlyArray<{ value: PeriodClockVariant; label: string }> = [
  { value: 'per_period', label: 'Per Period Reset' },
  { value: 'cumulative', label: 'Cumulative Across Periods' },
] as const;

export function parseCustomPeriodLabelsInput(value: string | null | undefined): string[] | null {
  if (!value) {
    return null;
  }

  const labels = value
    .split(',')
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  return labels.length > 0 ? labels : null;
}

export function serializeCustomPeriodLabelsInput(labels: readonly string[] | null | undefined): string {
  if (!labels || labels.length === 0) {
    return '';
  }

  return labels.join(', ');
}

export function hasInvalidCustomPeriodLabelsInput(value: string | null | undefined): boolean {
  const labels = parseCustomPeriodLabelsInput(value);
  if (!labels) {
    return false;
  }

  return labels.some((label) => !MACHINE_LABEL_KEY_PATTERN.test(label));
}

export function validateInitialTimeMinSeconds(
  initialTimeMode: 'max' | 'zero' | 'min' | null | undefined,
  initialTimeMinSeconds: number | null | undefined
): boolean {
  if (initialTimeMode !== 'min') {
    return true;
  }
  return initialTimeMinSeconds !== null && initialTimeMinSeconds !== undefined && initialTimeMinSeconds >= 0;
}
