import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchPlayersTabComponent } from './match-players-tab.component';
import { By } from '@angular/platform-browser';

describe('MatchPlayersTabComponent', () => {
  let component: MatchPlayersTabComponent;
  let fixture: ComponentFixture<MatchPlayersTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchPlayersTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchPlayersTabComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state when data is null', () => {
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.match-players-tab__loading'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Loading players...');
  });

  describe('getInitials', () => {
    it('should return initials for full name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('Jane Marie Smith')).toBe('JS');
    });

    it('should return first two letters for single name', () => {
      expect(component.getInitials('John')).toBe('JO');
    });

    it('should return ?? for null or undefined', () => {
      expect(component.getInitials(null)).toBe('??');
      expect(component.getInitials(undefined)).toBe('??');
    });

    it('should handle empty string', () => {
      expect(component.getInitials('')).toBe('??');
    });
  });

  describe('Player photo URL', () => {
    it('should build static URL correctly', () => {
      const result = component.playerPhotoUrl('player.jpg');
      expect(result).toContain('player.jpg');
    });
  });

  describe('Computed properties with null data', () => {
    it('should return empty array for team A players when data is null', () => {
      const players = component.teamAPlayers();
      expect(players).toEqual([]);
    });

    it('should return empty array for team B players when data is null', () => {
      const players = component.teamBPlayers();
      expect(players).toEqual([]);
    });
  });
});
