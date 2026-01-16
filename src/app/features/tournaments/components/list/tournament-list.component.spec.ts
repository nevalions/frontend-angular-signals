import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TournamentListComponent } from './tournament-list.component';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { Tournament } from '../../models/tournament.model';
import { Season } from '../../../seasons/models/season.model';
import { Sport } from '../../../sports/models/sport.model';

describe('TournamentListComponent', () => {
  let component: TournamentListComponent;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let tournamentStoreMock: {
    tournaments: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    tournamentsBySportAndSeason: ReturnType<typeof vi.fn>;
  };
  let seasonStoreMock: {
    seasons: ReturnType<typeof vi.fn>;
    seasonByYear: ReturnType<typeof vi.fn>;
  };
  let sportStoreMock: { sports: ReturnType<typeof vi.fn> };

  const mockTournaments: Tournament[] = [
    { id: 1, title: 'Championship 2024', season_id: 1, sport_id: 1, description: 'Main tournament' },
    { id: 2, title: 'Friendly Cup', season_id: 1, sport_id: 1, description: 'Friendly match' },
  ];

  const mockSeasons: Season[] = [
    { id: 1, year: 2024, description: '2024 Season' },
    { id: 2, year: 2025, description: '2025 Season' },
  ];

  const mockSports: Sport[] = [
    { id: 1, title: 'Football', description: 'Soccer' },
    { id: 2, title: 'Basketball', description: 'Basketball sport' },
  ];

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    seasonStoreMock = {
      seasons: vi.fn(() => mockSeasons),
      seasonByYear: vi.fn(() => {
        const map = new Map<number, Season>();
        mockSeasons.forEach((s) => map.set(s.year, s));
        return map;
      }),
    };

    sportStoreMock = {
      sports: vi.fn(() => mockSports),
    };

    tournamentStoreMock = {
      tournaments: vi.fn(() => mockTournaments),
      loading: vi.fn(() => false),
      tournamentsBySportAndSeason: vi.fn(() => {
        const map = new Map<string, Tournament[]>();
        map.set('1-1', mockTournaments);
        return map;
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: SportStoreService, useValue: sportStoreMock },
      ],
    });

    component = TestBed.createComponent(TournamentListComponent).componentInstance;
  });

  describe('Component initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Route params', () => {
    it('should read sportId from route params', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'sportId' ? '1' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.sportId()).toBe(1);
    });

    it('should read year from route params', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'year' ? '2024' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.initialYear()).toBe(2024);
    });
  });

  describe('Computed signals', () => {
    it('should filter tournaments by sport and season', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => {
          if (key === 'sportId') return '1';
          if (key === 'year') return '2024';
          return null;
        }}),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      const tournaments = newComponent.tournaments();
      expect(tournaments).toEqual(mockTournaments);
    });

    it('should return empty tournaments when sportId is null', () => {
      const routeMock = {
        paramMap: of({ get: () => null }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.tournaments()).toEqual([]);
    });

    it('should return empty tournaments when year is null', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'sportId' ? '1' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.tournaments()).toEqual([]);
    });

    it('should get sport by id from store', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'sportId' ? '1' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      const sport = newComponent.sport();
      expect(sport).toEqual(mockSports[0]);
    });

    it('should return null when sport is not found', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'sportId' ? '99' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.sport()).toBeNull();
    });

    it('should get season by year from store', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'year' ? '2024' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      const season = newComponent.season();
      expect(season).toEqual(mockSeasons[0]);
    });

    it('should return null when season is not found', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'year' ? '2026' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      expect(newComponent.season()).toBeNull();
    });

    it('should expose loading state from store', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('Navigation methods', () => {
    it('should navigate back to seasons year page', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => (key === 'year' ? '2024' : null) }),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      newComponent.navigateBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 'year', 2024]);
    });

    it('should navigate to create tournament page', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => {
          if (key === 'sportId') return '1';
          if (key === 'year') return '2024';
          return null;
        }}),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      newComponent.navigateToCreate();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments', 'new']);
    });

    it('should navigate to tournament detail page', () => {
      const routeMock = {
        paramMap: of({ get: (key: string) => {
          if (key === 'sportId') return '1';
          if (key === 'year') return '2024';
          return null;
        }}),
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: Router, useValue: routerMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      newComponent.navigateToDetail(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments', 1]);
    });
  });
});
