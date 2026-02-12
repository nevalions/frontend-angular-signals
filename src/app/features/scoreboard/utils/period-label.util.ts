import { SportPeriodMode } from '../../matches/models/scoreboard.model';

const LEGACY_PERIOD_KEYS = ['1st', '2nd', '3rd', '4th', 'OT'] as const;

interface PeriodLabelInput {
  value: string | null | undefined;
  mode: SportPeriodMode | null | undefined;
  customLabels: readonly string[] | null | undefined;
  translateQuarter: (value: string | null | undefined) => string;
}

export function getPeriodFieldLabel(mode: SportPeriodMode | null | undefined): string {
  return mode === 'qtr' || mode == null ? 'Quarter' : 'Period';
}

export function getPeriodOptions(
  mode: SportPeriodMode | null | undefined,
  customLabels: readonly string[] | null | undefined,
  current: string | null | undefined,
): string[] {
  const base = mode === 'custom' && customLabels && customLabels.length > 0
    ? [...customLabels]
    : [...LEGACY_PERIOD_KEYS];

  if (current && !base.includes(current)) {
    return [current, ...base];
  }

  return base;
}

export function formatPeriodLabel({
  value,
  mode,
  customLabels,
  translateQuarter,
}: PeriodLabelInput): string {
  const rawValue = value ?? '';
  if (!rawValue) return '';

  if (mode == null || mode === 'qtr') {
    return translateQuarter(rawValue);
  }

  if (mode === 'custom') {
    const customValue = customLabels?.find((item) => item === rawValue) ?? rawValue;
    return humanizeCustomLabel(customValue);
  }

  if (rawValue.toUpperCase() === 'OT') {
    return translateQuarter(rawValue);
  }

  const index = extractPeriodIndex(rawValue, customLabels);
  if (index == null) {
    return translateQuarter(rawValue);
  }

  switch (mode) {
    case 'half':
      return `${index}H`;
    case 'period':
      return `P${index}`;
    case 'set':
      return `S${index}`;
    case 'inning':
      return `IN${index}`;
    default:
      return translateQuarter(rawValue);
  }
}

function extractPeriodIndex(
  value: string,
  customLabels: readonly string[] | null | undefined,
): number | null {
  if (customLabels && customLabels.length > 0) {
    const customIndex = customLabels.indexOf(value);
    if (customIndex >= 0) {
      return customIndex + 1;
    }
  }

  const normalized = value.trim().toLowerCase();
  const numericMatch = normalized.match(/^(\d+)/);
  if (numericMatch) {
    return Number(numericMatch[1]);
  }

  const ordinalMap: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
  };

  return ordinalMap[normalized] ?? null;
}

function humanizeCustomLabel(label: string): string {
  return label
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.toUpperCase())
    .join(' ');
}
