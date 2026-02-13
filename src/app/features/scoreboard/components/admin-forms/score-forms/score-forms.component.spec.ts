import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiInputNumber, TuiSelect } from '@taiga-ui/kit';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { ScoreFormsComponent } from './score-forms.component';
import { MatchData } from '../../../../matches/models/match-data.model';
import { Scoreboard } from '../../../../matches/models/scoreboard.model';

describe('ScoreFormsComponent', () => {
  let component: ScoreFormsComponent;
  let fixture: ComponentFixture<ScoreFormsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TuiButton,
        TuiDataList,
        TuiIcon,
        TuiTextfield,
        TuiInputNumber,
        TuiSelect,
        TuiChevron,
        CollapsibleSectionComponent,
        ScoreFormsComponent,
      ],
    });

    fixture = TestBed.createComponent(ScoreFormsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default quarter selected', () => {
    expect(component['selectedQtr']()).toBe('1st');
  });

  it('should sync quarter from match data', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '3rd',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    expect(component['selectedQtr']()).toBe('3rd');
  });

  it('should handle quick score for team A', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 0,
      score_team_b: 0,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    component['pendingScoreTeamA'].set(0);

    const emitSpy = vi.spyOn(component.scoreChange, 'emit');
    component.onQuickScore('a', 6);

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', score: 6 });
    expect(component['pendingScoreTeamA']()).toBe(6);
  });

  it('should use default quick score deltas when payload is missing', () => {
    component.scoreboard = vi.fn(() => ({
      quick_score_deltas: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    const values = component['quickScoreButtons']().map((btn) => btn.value);
    expect(values).toEqual([6, 3, 2, 1, -1]);
  });

  it('should render quick score buttons from preset deltas in configured order', () => {
    component.scoreboard = vi.fn(() => ({
      quick_score_deltas: [1, -1],
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    const buttons = component['quickScoreButtons']();
    expect(buttons.map((btn) => btn.label)).toEqual(['+1', '-1']);
    expect(buttons.map((btn) => btn.value)).toEqual([1, -1]);
  });

  it('should apply quick score click updates using preset-driven deltas', () => {
    component.scoreboard = vi.fn(() => ({
      quick_score_deltas: [1, -1],
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    component.matchData = vi.fn(() => ({
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 1,
      score_team_b: 0,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    } as MatchData)) as unknown as typeof component.matchData;

    fixture.detectChanges();
    component['pendingScoreTeamA'].set(1);

    const emitSpy = vi.spyOn(component.scoreChange, 'emit');
    const minusOne = component['quickScoreButtons']()[1]?.value;

    expect(minusOne).toBe(-1);
    component.onQuickScore('a', minusOne ?? -1);

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', score: 0 });
    expect(component['pendingScoreTeamA']()).toBe(0);
  });

  it('should handle quick score for team B', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 3,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    component['pendingScoreTeamB'].set(3);

    const emitSpy = vi.spyOn(component.scoreChange, 'emit');
    component.onQuickScore('b', 3);

    expect(emitSpy).toHaveBeenCalledWith({ team: 'b', score: 6 });
    expect(component['pendingScoreTeamB']()).toBe(6);
  });

  it('should handle timeout use for team A', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.timeoutChange, 'emit');
    component.onUseTimeout('a');

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', timeouts: 'oo●' });
  });

  it('should handle timeout restore for team A', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'oo●',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.timeoutChange, 'emit');
    component.onRestoreTimeout('a');

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', timeouts: 'ooo' });
  });

  it('should handle timeout reset for team A', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'o●●',
      timeout_team_b: 'oo●',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.timeoutChange, 'emit');
    component.onResetTimeouts('a');

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', timeouts: 'ooo' });
  });

  it('should prevent negative scores', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 0,
      score_team_b: 0,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    component['pendingScoreTeamA'].set(0);

    const emitSpy = vi.spyOn(component.scoreChange, 'emit');
    component.onQuickScore('a', -1);

    expect(emitSpy).toHaveBeenCalledWith({ team: 'a', score: 0 });
    expect(component['pendingScoreTeamA']()).toBe(0);
  });

  it('should have correct timeout indicators for team A', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'oo●',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    const indicators = component['indicatorsTeamA']();
    expect(indicators).toEqual([true, true, false]);
  });

  it('should have correct timeout indicators for team B', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'ooo',
      timeout_team_b: 'o●●',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    const indicators = component['indicatorsTeamB']();
    expect(indicators).toEqual([true, false, false]);
  });

  it('should emit scoreboardIndicatorChange when toggling touchdown for team A', () => {
    component.scoreboard = vi.fn(() => ({
      is_goal_team_a: false,
      is_timeout_team_a: true,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    const emitSpy = vi.spyOn(component.scoreboardIndicatorChange, 'emit');
    component.onTouchdownIndicatorToggle('a');

    expect(emitSpy).toHaveBeenCalledWith({ is_goal_team_a: true, is_timeout_team_a: false });
  });

  it('should emit scoreboardIndicatorChange when toggling timeout for team B', () => {
    component.scoreboard = vi.fn(() => ({
      is_timeout_team_b: false,
      is_goal_team_b: true,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    const emitSpy = vi.spyOn(component.scoreboardIndicatorChange, 'emit');
    component.onTimeoutIndicatorToggle('b');

    expect(emitSpy).toHaveBeenCalledWith({ is_timeout_team_b: true, is_goal_team_b: false });
  });

  it('should emit minimal update when turning touchdown off for team A', () => {
    component.scoreboard = vi.fn(() => ({
      is_goal_team_a: true,
      is_timeout_team_a: false,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    const emitSpy = vi.spyOn(component.scoreboardIndicatorChange, 'emit');
    component.onTouchdownIndicatorToggle('a');

    expect(emitSpy).toHaveBeenCalledWith({ is_goal_team_a: false });
  });

  it('should calculate hasChanges correctly', () => {
    const matchData: MatchData = {
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 10,
      score_team_b: 7,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    };

    component.matchData = vi.fn(() => matchData) as unknown as typeof component.matchData;
    fixture.detectChanges();

    component['pendingScoreTeamA'].set(10);
    component['pendingScoreTeamB'].set(7);

    expect(component['hasChanges']()).toBe(false);

    component.onScoreAChange(11);
    expect(component['hasChanges']()).toBe(true);

    component.onScoreAChange(10);
    expect(component['hasChanges']()).toBe(false);
  });

  it('should emit qtrChange when quarter changes', () => {
    const emitSpy = vi.spyOn(component.qtrChange, 'emit');
    component.qtrChange.emit({ qtr: '3rd', period_key: 'period.3' });

    expect(emitSpy).toHaveBeenCalledWith({ qtr: '3rd', period_key: 'period.3' });
  });

  it('emits canonical period change payload without clock max recalculation fields', () => {
    component.matchData = vi.fn(() => ({
      id: 1,
      match_id: 1,
      qtr: '1st',
      score_team_a: 0,
      score_team_b: 0,
      timeout_team_a: 'ooo',
      timeout_team_b: 'ooo',
    } as MatchData)) as unknown as typeof component.matchData;

    component.scoreboard = vi.fn(() => ({
      is_qtr: true,
      period_mode: 'half',
      period_labels_json: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.qtrChange, 'emit');
    component['selectedQtr'].set('period.2');

    expect(emitSpy).toHaveBeenCalledWith({ qtr: '2nd', period_key: 'period.2' });
    const payload = emitSpy.mock.calls[0][0] as { qtr: string; period_key: string } & Record<string, unknown>;
    expect(payload).not.toHaveProperty('gameclock_max');
  });

  it('should expose canonical period options when period_count is provided', () => {
    component.scoreboard = vi.fn(() => ({
      is_qtr: true,
      period_mode: 'period',
      period_count: 3,
      period_labels_json: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    expect(component['periodOptions']()).toEqual(['period.1', 'period.2', 'period.3']);
  });

  it('should use period label when period_mode is missing but is_qtr is false', () => {
    component.scoreboard = vi.fn(() => ({
      is_qtr: false,
      period_mode: null,
      period_labels_json: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    expect(component['periodFieldLabel']()).toBe('Period');
  });

  it('should format legacy quarter values as halves when is_qtr is false', () => {
    component.scoreboard = vi.fn(() => ({
      is_qtr: false,
      period_mode: null,
      period_labels_json: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    expect(component['quarterStringify']('1st')).toBe('1H');
    expect(component['quarterStringify']('2nd')).toBe('2H');
  });

  it('should expose only two period options in half mode', () => {
    component.scoreboard = vi.fn(() => ({
      is_qtr: false,
      period_mode: null,
      period_labels_json: null,
    } as unknown as Scoreboard)) as unknown as typeof component.scoreboard;

    fixture.detectChanges();

    expect(component['periodOptions']()).toEqual(['1st', '2nd']);
  });
});
