import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TournamentListComponent } from './tournament-list.component';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { Tournament } from '../../models/tournament.model';
import { Season } from '../../../seasons/models/season.model';
import { Sport } from '../../../sports/models/sport.model';

describe('TournamentListComponent', () => {
  let component: TournamentListComponent;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let navHelperMock: {
    toSportDetail: ReturnType<typeof vi.fn>;
    toTournamentDetail: ReturnType<typeof vi.fn>;
    toTournamentCreate: ReturnType<typeof vi.fn>;
  };
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

    navHelperMock = {
      toSportDetail: vi.fn(),
      toTournamentDetail: vi.fn(),
      toTournamentCreate: vi.fn(),
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
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => null }) } },
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
      TestBed.resetTestingModule();
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
      TestBed.resetTestingModule();
      const routeMock = {
        paramMap: of({ get: (key: string) => {
          if (key === 'sportId') return '1';
          if (key === 'year') return '2024';
          return null;
        }}),
        queryParamMap: of({ get: (key: string) => {
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
      const fixture = TestBed.createComponent(TournamentListComponent);
      fixture.detectChanges();
      const tournaments = fixture.componentInstance.tournaments();
      expect(tournaments).toEqual(mockTournaments);
    });

    it('should return empty tournaments when sportId is null', () => {
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
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
      TestBed.resetTestingModule();
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
      const fixture = TestBed.createComponent(TournamentListComponent);
      fixture.detectChanges();
      const season = fixture.componentInstance.season();
      expect(season).toEqual(mockSeasons[0]);
    });

    it('should return null when season is not found', () => {
      TestBed.resetTestingModule();
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
      const fixture = TestBed.createComponent(TournamentListComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.season()).toBeNull();
    });

    it('should expose loading state from store', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('Navigation methods', () => {
    it('should navigate back to seasons year page', () => {
      TestBed.resetTestingModule();
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
          { provide: NavigationHelperService, useValue: navHelperMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      (newComponent as any).selectedSeasonYear.set(2024);
      newComponent.navigateBack();
      expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1, 2024);
    });

    it('should navigate to create tournament page', () => {
      TestBed.resetTestingModule();
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
          { provide: NavigationHelperService, useValue: navHelperMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      (newComponent as any).selectedSeasonYear.set(2024);
      newComponent.navigateToCreate();
      expect(navHelperMock.toTournamentCreate).toHaveBeenCalledWith(1, 2024);
    });

    it('should navigate to tournament detail page', () => {
      TestBed.resetTestingModule();
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
          { provide: NavigationHelperService, useValue: navHelperMock },
          { provide: TournamentStoreService, useValue: tournamentStoreMock },
          { provide: SeasonStoreService, useValue: seasonStoreMock },
          { provide: SportStoreService, useValue: sportStoreMock },
        ],
      });
      const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
      (newComponent as any).selectedSeasonYear.set(2024);
      newComponent.navigateToDetail(1);
      expect(navHelperMock.toTournamentDetail).toHaveBeenCalledWith(1, 2024, 1);
    });
  });
});
