import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchStatsTabComponent } from './match-stats-tab.component';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MatchStoreService } from '../../../services/match-store.service';

const mockComprehensiveData = {
  match: { id: 1, date: '2024-01-01' },
  teams: {
    team_a: { id: 1, title: 'Team A', team_logo_url: null, team_color: '#ff0000' },
    team_b: { id: 2, title: 'Team B', team_logo_url: 'team_b.png', team_color: '#0000ff' }
  },
  players: [],
  events: []
};

const mockStats = {
  team_a: {
    team_stats: {
      offence_yards: 350,
      pass_att: 25,
      run_att: 20,
      avg_yards_per_att: 7.5,
      pass_yards: 200,
      run_yards: 150,
      lost_yards: 10,
      flag_yards: 45,
      third_down_attempts: 10,
      third_down_conversions: 5,
      fourth_down_attempts: 2,
      fourth_down_conversions: 1,
      first_down_gained: 18,
      turnovers: 1
    },
    offense_stats: {
      pass_attempts: 25,
      pass_received: 18,
      pass_yards: 200,
      pass_td: 2,
      run_attempts: 20,
      run_yards: 150,
      run_avr: 7.5,
      run_td: 1,
      fumble: 0
    },
    qb_stats: {
      passes: 25,
      passes_completed: 18,
      pass_yards: 200,
      pass_td: 2,
      pass_avr: 8.0,
      run_attempts: 5,
      run_yards: 25,
      run_td: 0,
      run_avr: 5.0,
      fumble: 0,
      interception: 1,
      qb_rating: 95.5
    },
    defense_stats: {
      tackles: 45,
      assist_tackles: 15,
      sacks: 3,
      interceptions: 2,
      fumble_recoveries: 1,
      flags: 5
    }
  },
  team_b: {
    team_stats: {
      offence_yards: 280,
      pass_att: 30,
      run_att: 15,
      avg_yards_per_att: 6.0,
      pass_yards: 180,
      run_yards: 100,
      lost_yards: 15,
      flag_yards: 60,
      third_down_attempts: 12,
      third_down_conversions: 4,
      fourth_down_attempts: 1,
      fourth_down_conversions: 0,
      first_down_gained: 14,
      turnovers: 2
    },
    offense_stats: {
      pass_attempts: 30,
      pass_received: 20,
      pass_yards: 180,
      pass_td: 1,
      run_attempts: 15,
      run_yards: 100,
      run_avr: 6.7,
      run_td: 0,
      fumble: 1
    },
    qb_stats: {
      passes: 30,
      passes_completed: 20,
      pass_yards: 180,
      pass_td: 1,
      pass_avr: 6.0,
      run_attempts: 3,
      run_yards: 10,
      run_td: 0,
      run_avr: 3.3,
      fumble: 1,
      interception: 2,
      qb_rating: 72.3
    },
    defense_stats: {
      tackles: 38,
      assist_tackles: 12,
      sacks: 1,
      interceptions: 1,
      fumble_recoveries: 0,
      flags: 8
    }
  }
};

describe('MatchStatsTabComponent', () => {
  let component: MatchStatsTabComponent;
  let fixture: ComponentFixture<MatchStatsTabComponent>;
  let componentRef: ComponentRef<MatchStatsTabComponent>;
  let mockMatchStoreService: {
    getMatchStats: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockMatchStoreService = {
      getMatchStats: vi.fn().mockReturnValue(of(mockStats))
    };

    await TestBed.configureTestingModule({
      imports: [MatchStatsTabComponent],
      providers: [
        { provide: MatchStoreService, useValue: mockMatchStoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchStatsTabComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state when data is null', () => {
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.match-stats-tab__loading'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Loading statistics...');
  });

  describe('Computed properties with null data', () => {
    it('should return empty array for stat categories when stats are null', () => {
      const categories = component.statCategories();
      expect(categories).toEqual([]);
    });
  });

  describe('Computed titles', () => {
    it('should return default team A title when data is null', () => {
      expect(component.teamATitle()).toBe('Team A');
    });

    it('should return default team B title when data is null', () => {
      expect(component.teamBTitle()).toBe('Team B');
    });
  });

  describe('getBarWidth', () => {
    it('should calculate correct width for team A', () => {
      expect(component.getBarWidth(60, 40)).toBe(60);
      expect(component.getBarWidth(100, 0)).toBe(100);
      expect(component.getBarWidth(0, 100)).toBe(0);
    });

    it('should return 50 when both values are zero', () => {
      expect(component.getBarWidth(0, 0)).toBe(50);
    });

    it('should handle equal values', () => {
      expect(component.getBarWidth(50, 50)).toBe(50);
    });
  });

  describe('formatValue', () => {
    it('should return integer as string', () => {
      expect(component.formatValue(10)).toBe('10');
      expect(component.formatValue(100)).toBe('100');
    });

    it('should return decimal with one decimal place', () => {
      expect(component.formatValue(7.5)).toBe('7.5');
      expect(component.formatValue(10.25)).toBe('10.3');
    });
  });

  describe('getTeamLogo', () => {
    it('should return null when team has no logo', () => {
      const team = { team_logo_url: null };
      expect(component.getTeamLogo(team)).toBeNull();
    });

    it('should return URL when team has logo', () => {
      const team = { team_logo_url: 'logo.png' };
      const result = component.getTeamLogo(team);
      expect(result).toContain('logo.png');
    });
  });

  describe('getInitials', () => {
    it('should return initials for full name', () => {
      expect(component.getInitials('Team Alpha')).toBe('TA');
    });

    it('should return first two letters for single word', () => {
      expect(component.getInitials('Alpha')).toBe('AL');
    });

    it('should return ?? for null or undefined', () => {
      expect(component.getInitials(null)).toBe('??');
      expect(component.getInitials(undefined)).toBe('??');
    });
  });

  describe('Data loading', () => {
    it('should load stats on init when comprehensiveData is provided', () => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();

      expect(mockMatchStoreService.getMatchStats).toHaveBeenCalledWith(1);
    });

    it('should not load stats when comprehensiveData is null', () => {
      fixture.detectChanges();

      expect(mockMatchStoreService.getMatchStats).not.toHaveBeenCalled();
    });

    it('should handle stats loading error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockMatchStoreService.getMatchStats.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Stat categories with loaded data', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should have four stat categories', () => {
      const categories = component.statCategories();
      expect(categories).toHaveLength(4);
    });

    it('should include Team Performance category', () => {
      const categories = component.statCategories();
      const teamPerf = categories.find(c => c.title === 'Team Performance');
      expect(teamPerf).toBeTruthy();
      expect(teamPerf?.icon).toBe('@tui.bar-chart-2');
    });

    it('should include Offensive Stats category', () => {
      const categories = component.statCategories();
      const offense = categories.find(c => c.title === 'Offensive Stats');
      expect(offense).toBeTruthy();
      expect(offense?.icon).toBe('@tui.trending-up');
    });

    it('should include Quarterback Stats category', () => {
      const categories = component.statCategories();
      const qb = categories.find(c => c.title === 'Quarterback Stats');
      expect(qb).toBeTruthy();
      expect(qb?.icon).toBe('@tui.target');
    });

    it('should include Defensive Stats category', () => {
      const categories = component.statCategories();
      const defense = categories.find(c => c.title === 'Defensive Stats');
      expect(defense).toBeTruthy();
      expect(defense?.icon).toBe('@tui.shield');
    });

    it('should have stats with correct team values', () => {
      const categories = component.statCategories();
      const teamPerf = categories.find(c => c.title === 'Team Performance');
      const totalYards = teamPerf?.stats.find(s => s.label === 'Total Yards');
      
      expect(totalYards?.teamA).toBe(350);
      expect(totalYards?.teamB).toBe(280);
    });
  });

  describe('UI rendering with mock data', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should display team header', () => {
      const teamHeader = fixture.debugElement.query(By.css('.match-stats-tab__team-header'));
      expect(teamHeader).toBeTruthy();
    });

    it('should display team comparison', () => {
      const teamComparison = fixture.debugElement.query(By.css('.match-stats-tab__team-comparison'));
      expect(teamComparison).toBeTruthy();
    });

    it('should display VS text', () => {
      const vsText = fixture.debugElement.query(By.css('.match-stats-tab__vs-text'));
      expect(vsText).toBeTruthy();
      expect(vsText.nativeElement.textContent).toContain('VS');
    });

    it('should display legend', () => {
      const legend = fixture.debugElement.query(By.css('.match-stats-tab__legend'));
      expect(legend).toBeTruthy();
    });

    it('should display stat categories', () => {
      const categories = fixture.debugElement.queryAll(By.css('.match-stats-tab__category'));
      expect(categories.length).toBe(4);
    });

    it('should display stat rows', () => {
      const statRows = fixture.debugElement.queryAll(By.css('.match-stats-tab__stat-row'));
      expect(statRows.length).toBeGreaterThan(0);
    });

    it('should display progress bars', () => {
      const bars = fixture.debugElement.queryAll(By.css('.match-stats-tab__bar'));
      expect(bars.length).toBeGreaterThan(0);
    });
  });

  describe('Stats loading state', () => {
    it('should display loading stats message when stats are loading', () => {
      // Create a new component with a service that doesn't return immediately
      TestBed.resetTestingModule();
      const pendingMockService = {
        getMatchStats: vi.fn().mockReturnValue(of(null).pipe()) // Returns null, simulating no data yet
      };
      TestBed.configureTestingModule({
        imports: [MatchStatsTabComponent],
        providers: [
          { provide: MatchStoreService, useValue: pendingMockService }
        ]
      });
      
      const newFixture = TestBed.createComponent(MatchStatsTabComponent);
      const newComponentRef = newFixture.componentRef;
      
      newComponentRef.setInput('comprehensiveData', mockComprehensiveData);
      newFixture.detectChanges();
      
      // Now stats should be null, showing loading state
      const loadingStats = newFixture.debugElement.query(By.css('.match-stats-tab__loading-stats'));
      expect(loadingStats).toBeTruthy();
    });
  });
});
