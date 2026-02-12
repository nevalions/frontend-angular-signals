import { SportPeriodMode } from '../../matches/models/scoreboard.model';

const LEGACY_PERIOD_KEYS = ['1st', '2nd', '3rd', '4th', 'OT'] as const;
const HALF_PERIOD_KEYS = ['1st', '2nd'] as const;

const PERIOD_MODE_DEFAULT_COUNT: Record<SportPeriodMode, number> = {
  qtr: 4,
  half: 2,
  period: 3,
  set: 5,
  inning: 9,
  custom: 0,
};

interface PeriodLabelInput {
  value: string | null | undefined;
  mode: SportPeriodMode | null | undefined;
  isQtr?: boolean | null | undefined;
  customLabels: readonly string[] | null | undefined;
  translateQuarter: (value: string | null | undefined) => string;
}

export function getPeriodFieldLabel(
  mode: SportPeriodMode | null | undefined,
  isQtr?: boolean | null | undefined,
): string {
  return resolveEffectivePeriodMode(mode, isQtr) === 'qtr' ? 'Quarter' : 'Period';
}

export function getPeriodLabelByMode(
  mode: SportPeriodMode | null | undefined,
  isQtr?: boolean | null | undefined,
): string {
  const effectiveMode = resolveEffectivePeriodMode(mode, isQtr);
  
  switch (effectiveMode) {
    case 'qtr':
      return 'Quarter';
    case 'half':
      return 'Half';
    case 'period':
      return 'Period';
    case 'set':
      return 'Set';
    case 'inning':
      return 'Inning';
    case 'custom':
      return 'Period';
    default:
      return 'Period';
  }
}

export function getPeriodOptions(
  mode: SportPeriodMode | null | undefined,
  isQtr: boolean | null | undefined,
  customLabels: readonly string[] | null | undefined,
  current: string | null | undefined,
  periodCount?: number | null | undefined,
): string[] {
  const effectiveMode = resolveEffectivePeriodMode(mode, isQtr);
  const hasCanonicalConfig = mode != null || periodCount != null || (customLabels?.length ?? 0) > 0;

  const base = effectiveMode === 'custom'
    ? [...(customLabels ?? [])]
    : hasCanonicalConfig
      ? effectiveMode === 'qtr'
        ? createOrdinalPeriodValues(resolvePeriodCount(periodCount, effectiveMode))
        : createCanonicalPeriodKeys(resolvePeriodCount(periodCount, effectiveMode))
      : effectiveMode === 'half'
        ? [...HALF_PERIOD_KEYS]
        : [...LEGACY_PERIOD_KEYS];

  if (current && !base.includes(current)) {
    return [current, ...base];
  }

  return base;
}

export function formatPeriodLabel({
  value,
  mode,
  isQtr,
  customLabels,
  translateQuarter,
}: PeriodLabelInput): string {
  const rawValue = value ?? '';
  if (!rawValue) return '';

  const effectiveMode = resolveEffectivePeriodMode(mode, isQtr);

  if (effectiveMode === 'qtr') {
    const index = extractPeriodIndex(rawValue, customLabels);
    return translateQuarter(index != null ? toOrdinal(index) : rawValue);
  }

  if (effectiveMode === 'custom') {
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

  switch (effectiveMode) {
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

export function toCanonicalPeriodKey(
  value: string | null | undefined,
  customLabels: readonly string[] | null | undefined,
): string {
  if (!value) {
    return 'period.1';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 'period.1';
  }

  if (customLabels?.includes(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.toLowerCase();
  if (/^period[._-]\d+$/.test(normalized)) {
    return normalized.replace(/[_-]/g, '.');
  }

  const index = extractPeriodIndex(trimmed, customLabels);
  return index != null ? `period.${index}` : trimmed;
}

export function toLegacyPeriodValue(
  value: string | null | undefined,
  customLabels: readonly string[] | null | undefined,
): string {
  if (!value) {
    return '1st';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '1st';
  }

  if (trimmed.toUpperCase() === 'OT') {
    return 'OT';
  }

  if (customLabels?.includes(trimmed)) {
    return trimmed;
  }

  const index = extractPeriodIndex(trimmed, customLabels);
  return index != null ? toOrdinal(index) : trimmed;
}

function resolveEffectivePeriodMode(
  mode: SportPeriodMode | null | undefined,
  isQtr?: boolean | null | undefined,
): SportPeriodMode {
  if (mode) {
    return mode;
  }

  if (isQtr === false) {
    return 'half';
  }

  return 'qtr';
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
  const canonicalPeriodMatch = normalized.match(/^period[._-](\d+)$/);
  if (canonicalPeriodMatch) {
    return Number(canonicalPeriodMatch[1]);
  }

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

function resolvePeriodCount(periodCount: number | null | undefined, mode: SportPeriodMode): number {
  if (periodCount != null && Number.isInteger(periodCount) && periodCount > 0) {
    return periodCount;
  }

  return PERIOD_MODE_DEFAULT_COUNT[mode];
}

function createCanonicalPeriodKeys(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `period.${index + 1}`);
}

function createOrdinalPeriodValues(count: number): string[] {
  return Array.from({ length: count }, (_, index) => toOrdinal(index + 1));
}

function toOrdinal(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${value}st`;
  }
  if (mod10 === 2 && mod100 !== 12) {
    return `${value}nd`;
  }
  if (mod10 === 3 && mod100 !== 13) {
    return `${value}rd`;
  }
  return `${value}th`;
}
