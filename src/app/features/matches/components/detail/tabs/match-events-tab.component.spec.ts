import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchEventsTabComponent } from './match-events-tab.component';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';

const mockComprehensiveData = {
  match: { id: 1, date: '2024-01-01' },
  teams: {
    team_a: { id: 1, title: 'Team A', team_color: '#ff0000' },
    team_b: { id: 2, title: 'Team B', team_color: '#0000ff' }
  },
  players: [],
  events: [
    {
      id: 1,
      event_qtr: 1,
      event_number: 1,
      event_down: 1,
      event_distance: 10,
      play_type: 'Pass',
      play_result: 'Touchdown',
      score_result: 'TD 7-0'
    },
    {
      id: 2,
      event_qtr: 1,
      event_number: 2,
      event_down: 1,
      event_distance: 10,
      play_type: 'Run',
      play_result: 'Gain 5',
      score_result: null
    },
    {
      id: 3,
      event_qtr: 2,
      event_number: 3,
      event_down: null,
      event_distance: null,
      play_type: 'Field Goal',
      play_result: 'Good',
      score_result: 'FG 10-0'
    },
    {
      id: 4,
      event_qtr: 2,
      event_number: 4,
      event_down: 3,
      event_distance: 7,
      play_type: 'Pass',
      play_result: 'Interception',
      score_result: null
    }
  ]
};

describe('MatchEventsTabComponent', () => {
  let component: MatchEventsTabComponent;
  let fixture: ComponentFixture<MatchEventsTabComponent>;
  let componentRef: ComponentRef<MatchEventsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchEventsTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchEventsTabComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
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

    it('should return array with 0 for quarter options when no events', () => {
      const options = component.quarterOptions();
      expect(options).toEqual([0]);
    });

    it('should return 0 for play counts when no events', () => {
      expect(component.passPlays()).toBe(0);
      expect(component.runPlays()).toBe(0);
      expect(component.scoringPlays()).toBe(0);
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

  describe('getPlayTypeIcon', () => {
    it('should return send icon for pass plays', () => {
      expect(component.getPlayTypeIcon('Pass')).toBe('@tui.send');
    });

    it('should return trending-up icon for run plays', () => {
      expect(component.getPlayTypeIcon('Run')).toBe('@tui.trending-up');
      expect(component.getPlayTypeIcon('Rush')).toBe('@tui.trending-up');
    });

    it('should return target icon for kicks/field goals', () => {
      expect(component.getPlayTypeIcon('Kick')).toBe('@tui.target');
      expect(component.getPlayTypeIcon('Field Goal')).toBe('@tui.target');
    });

    it('should return arrow-up icon for punts', () => {
      expect(component.getPlayTypeIcon('Punt')).toBe('@tui.arrow-up');
    });

    it('should return default icon for unknown plays', () => {
      expect(component.getPlayTypeIcon(null)).toBe('@tui.circle');
      expect(component.getPlayTypeIcon('Unknown')).toBe('@tui.circle');
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

  describe('isScoringPlay', () => {
    it('should return true for touchdowns', () => {
      expect(component.isScoringPlay({ id: 1, play_result: 'Touchdown' })).toBe(true);
      expect(component.isScoringPlay({ id: 1, play_result: 'TD' })).toBe(true);
    });

    it('should return true for field goals', () => {
      expect(component.isScoringPlay({ id: 1, play_result: 'Field Goal' })).toBe(true);
      expect(component.isScoringPlay({ id: 1, score_result: 'FG Good' })).toBe(true);
    });

    it('should return false for non-scoring plays', () => {
      expect(component.isScoringPlay({ id: 1, play_result: 'Incomplete' })).toBe(false);
      expect(component.isScoringPlay({ id: 1, play_result: 'Gain 5' })).toBe(false);
      expect(component.isScoringPlay({ id: 1 })).toBe(false);
    });
  });

  describe('isTurnover', () => {
    it('should return true for interceptions', () => {
      expect(component.isTurnover({ id: 1, play_result: 'Interception' })).toBe(true);
      expect(component.isTurnover({ id: 1, play_type: 'Interception' })).toBe(true);
    });

    it('should return true for fumbles', () => {
      expect(component.isTurnover({ id: 1, play_result: 'Fumble' })).toBe(true);
    });

    it('should return true for turnovers', () => {
      expect(component.isTurnover({ id: 1, play_type: 'Turnover' })).toBe(true);
    });

    it('should return false for non-turnover plays', () => {
      expect(component.isTurnover({ id: 1, play_result: 'Gain 5' })).toBe(false);
      expect(component.isTurnover({ id: 1, play_type: 'Pass' })).toBe(false);
    });
  });

  describe('getOrdinal', () => {
    it('should return correct ordinals', () => {
      expect(component.getOrdinal(1)).toBe('1st');
      expect(component.getOrdinal(2)).toBe('2nd');
      expect(component.getOrdinal(3)).toBe('3rd');
      expect(component.getOrdinal(4)).toBe('4th');
      expect(component.getOrdinal(11)).toBe('11th');
      expect(component.getOrdinal(21)).toBe('21st');
      expect(component.getOrdinal(22)).toBe('22nd');
      expect(component.getOrdinal(23)).toBe('23rd');
    });
  });

  describe('Quarter filtering', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should have all quarters in options', () => {
      const options = component.quarterOptions();
      expect(options).toContain(0); // All quarters
      expect(options).toContain(1);
      expect(options).toContain(2);
    });

    it('should show all events by default', () => {
      expect(component.selectedQuarter()).toBe(0);
      expect(component.filteredEvents()).toHaveLength(4);
    });

    it('should filter events by quarter', () => {
      component.onQuarterChange(1); // Select Q1
      expect(component.filteredEvents()).toHaveLength(2);
      expect(component.filteredEvents().every(e => e.event_qtr === 1)).toBe(true);
    });

    it('should calculate correct play counts', () => {
      expect(component.passPlays()).toBe(2);
      expect(component.runPlays()).toBe(1);
      expect(component.scoringPlays()).toBe(2); // TD and FG
    });
  });

  describe('UI rendering with mock data', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should display header card', () => {
      const headerCard = fixture.debugElement.query(By.css('.match-events-tab__header-card'));
      expect(headerCard).toBeTruthy();
    });

    it('should display stats summary', () => {
      const statsSummary = fixture.debugElement.query(By.css('.match-events-tab__stats-summary'));
      expect(statsSummary).toBeTruthy();
    });

    it('should display timeline', () => {
      const timeline = fixture.debugElement.query(By.css('.match-events-tab__timeline'));
      expect(timeline).toBeTruthy();
    });

    it('should display event cards', () => {
      const eventCards = fixture.debugElement.queryAll(By.css('.match-events-tab__event-card'));
      expect(eventCards.length).toBe(4);
    });

    it('should display quarter markers', () => {
      const quarterMarkers = fixture.debugElement.queryAll(By.css('.match-events-tab__quarter-marker'));
      expect(quarterMarkers.length).toBe(2); // Q1 and Q2
    });

    it('should highlight scoring plays', () => {
      const scoringCards = fixture.debugElement.queryAll(By.css('.match-events-tab__event-card--scoring'));
      expect(scoringCards.length).toBe(2);
    });

    it('should highlight turnover plays', () => {
      const turnoverCards = fixture.debugElement.queryAll(By.css('.match-events-tab__event-card--turnover'));
      expect(turnoverCards.length).toBe(1);
    });
  });

  describe('Empty state', () => {
    it('should display empty state when no events', () => {
      componentRef.setInput('comprehensiveData', {
        ...mockComprehensiveData,
        events: []
      });
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.match-events-tab__empty'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No Events Recorded');
    });
  });
});
