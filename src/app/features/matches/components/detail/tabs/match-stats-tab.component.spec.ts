import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchStatsTabComponent } from './match-stats-tab.component';
import { By } from '@angular/platform-browser';

describe('MatchStatsTabComponent', () => {
  let component: MatchStatsTabComponent;
  let fixture: ComponentFixture<MatchStatsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchStatsTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchStatsTabComponent);
    component = fixture.componentInstance;
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
    it('should return empty array for team stats when data is null', () => {
      const stats = component.teamStats();
      expect(stats).toEqual([]);
    });

    it('should return empty array for offense stats when data is null', () => {
      const stats = component.offenseStats();
      expect(stats).toEqual([]);
    });

    it('should return empty array for QB stats when data is null', () => {
      const stats = component.qbStats();
      expect(stats).toEqual([]);
    });

    it('should return empty array for defense stats when data is null', () => {
      const stats = component.defenseStats();
      expect(stats).toEqual([]);
    });
  });

  describe('getProgressColor', () => {
    it('should return team A color when team A dominates (>60%)', () => {
      expect(component.getProgressColor(7, 3)).toContain('categorical-01');
      expect(component.getProgressColor(9, 1)).toContain('categorical-01');
    });

    it('should return team B color when team B dominates (<40%)', () => {
      expect(component.getProgressColor(3, 7)).toContain('categorical-08');
      expect(component.getProgressColor(2, 8)).toContain('categorical-08');
    });

    it('should return neutral color for balanced stats (40%-60%)', () => {
      expect(component.getProgressColor(5, 5)).toContain('categorical-03');
      expect(component.getProgressColor(4, 5)).toContain('categorical-03');
      expect(component.getProgressColor(6, 4)).toContain('categorical-03');
    });

    it('should return default color when both values are zero', () => {
      expect(component.getProgressColor(0, 0)).toContain('categorical-01');
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

  describe('showProgressBar signal', () => {
    it('should have default value of true', () => {
      expect(component.showProgressBar()).toBe(true);
    });
  });
});
