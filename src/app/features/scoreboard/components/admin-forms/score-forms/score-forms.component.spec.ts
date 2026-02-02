import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiInputNumber, TuiSelect } from '@taiga-ui/kit';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { ScoreFormsComponent } from './score-forms.component';
import { MatchData } from '../../../../matches/models/match-data.model';

describe('ScoreFormsComponent', () => {
  let component: ScoreFormsComponent;
  let fixture: ComponentFixture<ScoreFormsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TuiButton,
        TuiIcon,
        TuiTextfield,
        TuiInputNumber,
        TuiSelect,
        TuiChevron,
        TuiDataListWrapper,
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

  it('should toggle touchdown called for team A', () => {
    component.toggleTouchdownCalled('a');
    expect(component['touchdownCalledTeamA']()).toBe(true);

    component.toggleTouchdownCalled('a');
    expect(component['touchdownCalledTeamA']()).toBe(false);
  });

  it('should toggle timeout called for team B', () => {
    component.toggleTimeoutCalled('b');
    expect(component['timeoutCalledTeamB']()).toBe(true);

    component.toggleTimeoutCalled('b');
    expect(component['timeoutCalledTeamB']()).toBe(false);
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
    component.qtrChange.emit({ qtr: '3rd' });

    expect(emitSpy).toHaveBeenCalledWith({ qtr: '3rd' });
  });
});
