import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ScoreboardDisplayComponent } from './scoreboard-display.component';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';

describe('ScoreboardDisplayComponent', () => {
  let component: ScoreboardDisplayComponent;
  let fixture: ComponentFixture<ScoreboardDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardDisplayComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreboardDisplayComponent);
    component = fixture.componentInstance;
  });

  it('uses scoreboard_goal_text when payload provides it', () => {
    const getGoalTextSpy = vi.spyOn(component['translations'], 'getGoalText').mockReturnValue('LEGACY');

    component.data = vi.fn(() => ({
      match_data: {},
      teams: {},
      scoreboard: {
        scoreboard_goal_text: 'SCORED',
      },
    } as unknown as ComprehensiveMatchData)) as unknown as typeof component.data;

    fixture.detectChanges();

    expect(component['goalText']()).toBe('SCORED');
    expect(getGoalTextSpy).not.toHaveBeenCalled();
  });

  it('falls back to translation goal text when payload field is missing', () => {
    vi.spyOn(component['translations'], 'getGoalText').mockReturnValue('LEGACY');

    component.data = vi.fn(() => ({
      match_data: {},
      teams: {},
      scoreboard: {
        scoreboard_goal_text: null,
      },
    } as unknown as ComprehensiveMatchData)) as unknown as typeof component.data;

    fixture.detectChanges();

    expect(component['goalText']()).toBe('LEGACY');
  });
});
