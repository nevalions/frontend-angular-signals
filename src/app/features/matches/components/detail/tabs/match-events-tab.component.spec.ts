import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchEventsTabComponent } from './match-events-tab.component';
import { By } from '@angular/platform-browser';

const mockComprehensiveData = {
  match: { id: 1, date: '2024-01-01' },
  teams: {
    team_a: { id: 1, title: 'Team A' },
    team_b: { id: 2, title: 'Team B' }
  },
  events: [
    {
      id: 1,
      event_qtr: '1',
      event_number: 1,
      event_down: 1,
      event_distance: 10,
      play_type: 'Pass',
      play_result: 'Touchdown',
      score_result: '7-0'
    },
    {
      id: 2,
      event_qtr: '2',
      event_number: 2,
      event_down: null,
      event_distance: null,
      play_type: 'Field Goal',
      play_result: 'Good',
      score_result: '10-0'
    },
    {
      id: 3,
      event_qtr: '3',
      event_number: 3,
      event_down: 3,
      event_distance: 7,
      play_type: 'Run',
      play_result: 'Turnover',
      score_result: '10-0'
    }
  ]
};

describe('MatchEventsTabComponent', () => {
  let component: MatchEventsTabComponent;
  let fixture: ComponentFixture<MatchEventsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchEventsTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchEventsTabComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state when data is null', () => {
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.match-events-tab__loading'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Loading events...');
  });

  describe('Computed properties with null data', () => {
    it('should return empty array for events when data is null', () => {
      const events = component.events();
      expect(events).toEqual([]);
    });
  });

  describe('getPlayTypeBadgeAppearance', () => {
    it('should return primary for pass plays', () => {
      expect(component.getPlayTypeBadgeAppearance('Pass')).toBe('primary');
      expect(component.getPlayTypeBadgeAppearance('Pass Complete')).toBe('primary');
    });

    it('should return accent for run plays', () => {
      expect(component.getPlayTypeBadgeAppearance('Run')).toBe('accent');
      expect(component.getPlayTypeBadgeAppearance('Rush')).toBe('accent');
    });

    it('should return info for kick/punt/field goal plays', () => {
      expect(component.getPlayTypeBadgeAppearance('Kick')).toBe('info');
      expect(component.getPlayTypeBadgeAppearance('Punt')).toBe('info');
      expect(component.getPlayTypeBadgeAppearance('Field Goal')).toBe('info');
    });

    it('should return negative for turnover plays', () => {
      expect(component.getPlayTypeBadgeAppearance('Turnover')).toBe('negative');
      expect(component.getPlayTypeBadgeAppearance('Fumble')).toBe('negative');
      expect(component.getPlayTypeBadgeAppearance('Interception')).toBe('negative');
    });

    it('should return neutral for unknown or null plays', () => {
      expect(component.getPlayTypeBadgeAppearance(null)).toBe('neutral');
      expect(component.getPlayTypeBadgeAppearance(undefined)).toBe('neutral');
      expect(component.getPlayTypeBadgeAppearance('Unknown')).toBe('neutral');
    });
  });

  describe('getResultBadgeAppearance', () => {
    it('should return positive for touchdowns', () => {
      expect(component.getResultBadgeAppearance('Touchdown')).toBe('positive');
      expect(component.getResultBadgeAppearance('TD')).toBe('positive');
      expect(component.getResultBadgeAppearance('Pass TD')).toBe('positive');
    });

    it('should return primary for field goals', () => {
      expect(component.getResultBadgeAppearance('Field Goal')).toBe('primary');
      expect(component.getResultBadgeAppearance('FG Good')).toBe('primary');
    });

    it('should return warning for incomplete passes', () => {
      expect(component.getResultBadgeAppearance('Incomplete')).toBe('warning');
      expect(component.getResultBadgeAppearance('Pass Incomplete')).toBe('warning');
    });

    it('should return negative for turnovers', () => {
      expect(component.getResultBadgeAppearance('Turnover')).toBe('negative');
      expect(component.getResultBadgeAppearance('Fumble')).toBe('negative');
      expect(component.getResultBadgeAppearance('Interception')).toBe('negative');
    });

    it('should return neutral for unknown or null results', () => {
      expect(component.getResultBadgeAppearance(null)).toBe('neutral');
      expect(component.getResultBadgeAppearance(undefined)).toBe('neutral');
      expect(component.getResultBadgeAppearance('Unknown')).toBe('neutral');
    });
  });

  describe('isScorePositive', () => {
    it('should return true for touchdowns', () => {
      expect(component.isScorePositive('touchdown')).toBe(true);
      expect(component.isScorePositive('TD')).toBe(true);
      expect(component.isScorePositive('Pass TD')).toBe(true);
    });

    it('should return true for field goals', () => {
      expect(component.isScorePositive('field goal')).toBe(true);
      expect(component.isScorePositive('FG Good')).toBe(true);
    });

    it('should return false for negative or null results', () => {
      expect(component.isScorePositive('Turnover')).toBe(false);
      expect(component.isScorePositive('Incomplete')).toBe(false);
      expect(component.isScorePositive(null)).toBe(false);
      expect(component.isScorePositive(undefined)).toBe(false);
    });
  });
});
