import { Injectable, signal } from '@angular/core';
import {
  coerceScoreboardLanguageCode,
  ScoreboardLanguage,
  type ScoreboardLanguageCode,
} from '../../../core/enums/scoreboard-language.enum';
import { SCOREBOARD_TRANSLATIONS } from '../../../core/constants/scoreboard-translations.constants';

@Injectable()
export class ScoreboardTranslationService {
  private readonly languageCode = signal<ScoreboardLanguageCode>(ScoreboardLanguage.En);

  setLanguage(code: ScoreboardLanguageCode | string | null | undefined): void {
    this.languageCode.set(coerceScoreboardLanguageCode(code, ScoreboardLanguage.En));
  }

  getQuarterLabel(quarter: string | null | undefined): string {
    const q = quarter ?? '';
    const t = SCOREBOARD_TRANSLATIONS[this.languageCode()];
    return t.quarterLabels[q] ?? q;
  }

  getDownLabel(down: string | null | undefined): string {
    const d = down ?? '';
    const t = SCOREBOARD_TRANSLATIONS[this.languageCode()];
    return t.downLabels[d] ?? d;
  }

  getGoalText(): string {
    return SCOREBOARD_TRANSLATIONS[this.languageCode()].goalText;
  }

  getFlagText(): string {
    return SCOREBOARD_TRANSLATIONS[this.languageCode()].flagText;
  }

  getTimeoutText(): string {
    return SCOREBOARD_TRANSLATIONS[this.languageCode()].timeoutText;
  }

  getDistanceLabel(distance: string | null | undefined): string {
    const dist = distance ?? '';
    const t = SCOREBOARD_TRANSLATIONS[this.languageCode()];
    return t.distanceLabels[dist] ?? t.specialStateLabels[dist] ?? dist;
  }

  formatDownDistance(down: string | null | undefined, distance: string | null | undefined): string {
    const downLabel = this.getDownLabel(down);
    const distanceLabel = this.getDistanceLabel(distance);

    if (!downLabel) return distanceLabel;
    if (!distanceLabel) return downLabel;

    const t = SCOREBOARD_TRANSLATIONS[this.languageCode()];
    return `${downLabel}${t.downDistanceSeparator}${distanceLabel}`;
  }
}
