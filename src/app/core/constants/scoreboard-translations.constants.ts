import { ScoreboardLanguage, type ScoreboardLanguageCode } from '../enums/scoreboard-language.enum';

export interface ScoreboardTranslations {
  quarterLabels: Readonly<Record<string, string>>;
  downLabels: Readonly<Record<string, string>>;
  distanceLabels: Readonly<Record<string, string>>;
  specialStateLabels: Readonly<Record<string, string>>;
  downDistanceSeparator: string;
  goalText: string;
  flagText: string;
  timeoutText: string;
}

const EN_TRANSLATIONS: ScoreboardTranslations = {
  quarterLabels: {
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th',
    OT: 'OT',
  },
  downLabels: {
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th',
  },
  distanceLabels: {
    INCH: 'INCH',
    GOAL: 'GOAL',
  },
  specialStateLabels: {
    'PAT 1': 'PAT 1',
    'PAT 2': 'PAT 2',
    FG: 'FG',
    'KICK OFF': 'KICK OFF',
  },
  downDistanceSeparator: ' & ',
  goalText: 'TOUCHDOWN',
  flagText: 'FLAG',
  timeoutText: 'TIMEOUT',
};

const RU_TRANSLATIONS: ScoreboardTranslations = {
  quarterLabels: {
    '1st': '1',
    '2nd': '2',
    '3rd': '3',
    '4th': '4',
    OT: 'ОТ',
  },
  downLabels: {
    '1st': '1-й',
    '2nd': '2-й',
    '3rd': '3-й',
    '4th': '4-й',
  },
  distanceLabels: {
    INCH: 'ДЮЙМ',
    GOAL: 'ГОЛ',
  },
  specialStateLabels: {
    'PAT 1': '1 ОЧКО',
    'PAT 2': '2 ОЧКА',
    FG: 'ФИЛД ГОЛ',
    'KICK OFF': 'НАЧ.УДАР',
  },
  downDistanceSeparator: ' & ',
  goalText: 'ТАЧДАУН',
  flagText: 'ФЛАГ',
  timeoutText: 'ТАЙМАУТ',
};

export const SCOREBOARD_TRANSLATIONS: Record<ScoreboardLanguageCode, ScoreboardTranslations> = {
  [ScoreboardLanguage.En]: EN_TRANSLATIONS,
  [ScoreboardLanguage.Ru]: RU_TRANSLATIONS,
};
