import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchPlayersTabComponent } from './match-players-tab.component';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PlayerMatch } from '../../../models/player-match.model';
import { MatchStoreService } from '../../../services/match-store.service';

const mockComprehensiveData = {
  match: { id: 1, date: '2024-01-01' },
  teams: {
    team_a: { id: 1, title: 'Team A', team_logo_url: null, team_color: '#ff0000' },
    team_b: { id: 2, title: 'Team B', team_logo_url: 'team_b.png', team_color: '#0000ff' }
  },
  players: [
    {
      id: 1,
      team_id: 1,
      is_starting: true,
      person: { first_name: 'John', second_name: 'Doe', photo_url: null },
      position: { title: 'Quarterback' },
      player_team_tournament: { player_number: 12 }
    },
    {
      id: 2,
      team_id: 1,
      is_starting: false,
      person: { first_name: 'Jane', second_name: 'Smith', photo_url: 'jane.jpg' },
      position: { title: 'Wide Receiver' },
      player_team_tournament: { player_number: 88 }
    },
    {
      id: 3,
      team_id: 2,
      is_starting: true,
      person: { first_name: 'Bob', second_name: 'Johnson', photo_url: null },
      position: { title: 'Running Back' },
      player_team_tournament: { player_number: 24 }
    },
    {
      id: 4,
      team_id: 2,
      is_starting: false,
      person: { first_name: 'Alice', second_name: 'Brown', photo_url: null },
      position: null,
      player_team_tournament: { player_number: null }
    }
  ],
  events: []
};

describe('MatchPlayersTabComponent', () => {
  let component: MatchPlayersTabComponent;
  let fixture: ComponentFixture<MatchPlayersTabComponent>;
  let componentRef: ComponentRef<MatchPlayersTabComponent>;

  beforeEach(async () => {
    const mockMatchStore = {
      updatePlayerMatch: vi.fn(() => of({} as PlayerMatch))
    } as unknown as MatchStoreService;

    await TestBed.configureTestingModule({
      imports: [MatchPlayersTabComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatchStoreService, useValue: mockMatchStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchPlayersTabComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
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

  describe('Team logo URL', () => {
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

  describe('Computed properties with null data', () => {
    it('should return empty array for team A players when data is null', () => {
      const players = component.teamAPlayers();
      expect(players).toEqual([]);
    });

    it('should return empty array for team B players when data is null', () => {
      const players = component.teamBPlayers();
      expect(players).toEqual([]);
    });

    it('should return empty arrays for starters and bench when data is null', () => {
      expect(component.teamAStarters()).toEqual([]);
      expect(component.teamABench()).toEqual([]);
      expect(component.teamBStarters()).toEqual([]);
      expect(component.teamBBench()).toEqual([]);
    });
  });

  describe('Computed properties with mock data', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should filter team A players correctly', () => {
      const players = component.teamAPlayers();
      expect(players).toHaveLength(2);
      expect(players.every(p => p.team_id === 1)).toBe(true);
    });

    it('should filter team B players correctly', () => {
      const players = component.teamBPlayers();
      expect(players).toHaveLength(2);
      expect(players.every(p => p.team_id === 2)).toBe(true);
    });

    it('should separate starters from bench for team A', () => {
      expect(component.teamAStarters()).toHaveLength(1);
      expect(component.teamAStarters()[0].person?.first_name).toBe('John');
      expect(component.teamAStarters()[0].person?.second_name).toBe('Doe');
      expect(component.teamABench()).toHaveLength(1);
      expect(component.teamABench()[0].person?.first_name).toBe('Jane');
      expect(component.teamABench()[0].person?.second_name).toBe('Smith');
    });

    it('should separate starters from bench for team B', () => {
      expect(component.teamBStarters()).toHaveLength(1);
      expect(component.teamBStarters()[0].person?.first_name).toBe('Bob');
      expect(component.teamBStarters()[0].person?.second_name).toBe('Johnson');
      expect(component.teamBBench()).toHaveLength(1);
      expect(component.teamBBench()[0].person?.first_name).toBe('Alice');
      expect(component.teamBBench()[0].person?.second_name).toBe('Brown');
    });
  });

  describe('UI rendering with mock data', () => {
    beforeEach(() => {
      componentRef.setInput('comprehensiveData', mockComprehensiveData);
      fixture.detectChanges();
    });

    it('should display team comparison layout', () => {
      const comparison = fixture.debugElement.query(By.css('.match-players-tab__comparison'));
      expect(comparison).toBeTruthy();
    });

    it('should display VS divider', () => {
      const vsText = fixture.debugElement.query(By.css('.match-players-tab__vs-text'));
      expect(vsText).toBeTruthy();
      expect(vsText.nativeElement.textContent).toContain('VS');
    });

    it('should display team headers with titles', () => {
      const teamColumns = fixture.debugElement.queryAll(By.css('.match-players-tab__team-column'));
      expect(teamColumns).toHaveLength(2);
    });

    it('should display starting lineup section', () => {
      const sectionHeaders = fixture.debugElement.queryAll(By.css('.match-players-tab__section-title'));
      const startingHeaders = sectionHeaders.filter(el => 
        el.nativeElement.textContent.includes('Starting Lineup')
      );
      expect(startingHeaders.length).toBeGreaterThan(0);
    });

    it('should display bench section', () => {
      const sectionHeaders = fixture.debugElement.queryAll(By.css('.match-players-tab__section-title'));
      const benchHeaders = sectionHeaders.filter(el => 
        el.nativeElement.textContent.includes('Bench')
      );
      expect(benchHeaders.length).toBeGreaterThan(0);
    });

    it('should display player cards', () => {
      const playerCards = fixture.debugElement.queryAll(By.css('.match-players-tab__player-card'));
      expect(playerCards.length).toBe(4);
    });

    it('should display player numbers', () => {
      const numberBadges = fixture.debugElement.queryAll(By.css('.match-players-tab__player-number-badge'));
      expect(numberBadges.length).toBe(4);
      expect(numberBadges[0].nativeElement.textContent.trim()).toBe('12');
    });

    it('should display player toggle switches', () => {
      fixture.detectChanges();
      const toggles = fixture.debugElement.queryAll(By.css('.match-players-tab__player-toggle'));
      expect(toggles.length).toBe(4);
    });

    it('should call updatePlayerMatch when toggle changes', () => {
      fixture.detectChanges();
      const toggleInputs = fixture.debugElement.queryAll(By.css('.match-players-tab__player-toggle input[type="checkbox"]'));
      const matchStore = TestBed.inject(MatchStoreService);

      (toggleInputs[0].nativeElement as HTMLInputElement).click();
      fixture.detectChanges();

      expect(matchStore.updatePlayerMatch).toHaveBeenCalledWith(1, { is_starting: false });
    });
  });
});
