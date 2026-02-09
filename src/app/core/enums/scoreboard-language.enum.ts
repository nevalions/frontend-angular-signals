export enum ScoreboardLanguage {
  En = 'en',
  Ru = 'ru',
}

export type ScoreboardLanguageCode = 'en' | 'ru';

export const LANGUAGE_OPTIONS = [
  { code: ScoreboardLanguage.En, label: 'English' },
  { code: ScoreboardLanguage.Ru, label: 'Русский' },
] as const satisfies ReadonlyArray<{ code: ScoreboardLanguageCode; label: string }>;

export function isScoreboardLanguageCode(value: unknown): value is ScoreboardLanguageCode {
  return value === ScoreboardLanguage.En || value === ScoreboardLanguage.Ru;
}

export function coerceScoreboardLanguageCode(
  value: unknown,
  fallback: ScoreboardLanguageCode = ScoreboardLanguage.En,
): ScoreboardLanguageCode {
  return isScoreboardLanguageCode(value) ? value : fallback;
}
