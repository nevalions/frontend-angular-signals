import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { SportDetailComponent } from './sport-detail.component';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { Sport } from '../../models/sport.model';

describe('SportDetailComponent', () => {
  let component: SportDetailComponent;
  let fixture: ComponentFixture<SportDetailComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }> };
  let sportStoreMock: { sports: ReturnType<typeof vi.fn>; deleteSport: ReturnType<typeof vi.fn> };
  let seasonStoreMock: { seasons: ReturnType<typeof vi.fn>; seasonByYear: ReturnType<typeof vi.fn> };
  let tournamentStoreMock: { tournamentsBySportAndSeason: ReturnType<typeof vi.fn> };
  let navHelperMock: { toSportsList: ReturnType<typeof vi.fn>; toSportEdit: ReturnType<typeof vi.fn>; toTournamentDetail: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    sportStoreMock = {
      sports: vi.fn().mockReturnValue([
        { id: 1, title: 'Football', description: 'Soccer sport' } as Sport,
        { id: 2, title: 'Basketball', description: 'Basketball sport' } as Sport,
      ]),
      deleteSport: vi.fn().mockReturnValue(of(void 0)),
    };

    const season2024 = { id: 1, year: 2024, description: 'Season 2024' };
    const season2025 = { id: 2, year: 2025, description: 'Season 2025' };

    const seasonMap = new Map<number, typeof season2024>([
      [2024, season2024],
      [2025, season2025],
    ]);

    seasonStoreMock = {
      seasons: vi.fn().mockReturnValue([
        season2024,
        season2025,
      ]),
      seasonByYear: vi.fn().mockReturnValue(seasonMap),
    };

    const tournamentMap = new Map<string, any[]>([
      ['1-1', [
        { id: 1, title: 'Premier League', description: 'Top division league', sport_id: 1, season_id: 1 },
        { id: 2, title: 'FA Cup', description: 'Domestic cup competition', sport_id: 1, season_id: 1 },
        { id: 3, title: 'Champions League', description: 'European club competition', sport_id: 1, season_id: 1 },
      ]],
    ]);

    tournamentStoreMock = {
      tournamentsBySportAndSeason: vi.fn().mockReturnValue(tournamentMap),
    };

    navHelperMock = {
      toSportsList: vi.fn(),
      toSportEdit: vi.fn(),
      toTournamentDetail: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    fixture = TestBed.createComponent(SportDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back on button click', () => {
    component.navigateBack();

    expect(navHelperMock.toSportsList).toHaveBeenCalled();
  });

  it('should navigate to tournaments on season item click', () => {
    component.navigateToTournaments(2024);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments']);
  });

  it('should navigate to edit', () => {
    component.navigateToEdit();

    expect(navHelperMock.toSportEdit).toHaveBeenCalledWith(1);
  });

  it('should find sport by id from store', () => {
    const sport = component.sport();

    expect(sport).toEqual({ id: 1, title: 'Football', description: 'Soccer sport' });
  });

  it('should expose seasons from season store', () => {
    const seasons = component.seasons();

    expect(seasons).toEqual([
      { id: 1, year: 2024, description: 'Season 2024' },
      { id: 2, year: 2025, description: 'Season 2025' },
    ]);
  });

  it('should filter tournaments by search query', () => {
    component.selectedSeasonYear.set(2024);
    component.onSearchChange('premier');

    const tournaments = component.tournaments();
    expect(tournaments).toHaveLength(1);
    expect(tournaments[0].title).toContain('Premier');
  });

  it('should clear search', () => {
    component.searchQuery.set('test');
    component.currentPage.set(2);
    component.clearSearch();

    expect(component.searchQuery()).toBe('');
    expect(component.currentPage()).toBe(1);
  });

  it('should paginate tournaments', () => {
    component.selectedSeasonYear.set(2024);
    component.currentPage.set(1);
    component.itemsPerPage.set(10);

    const paginated = component.paginatedTournaments();
    expect(paginated).toHaveLength(3);
  });

  it('should change page', () => {
    component.onPageChange(1);

    expect(component.currentPage()).toBe(2);
  });

  it('should change items per page and reset to page 1', () => {
    component.currentPage.set(3);
    component.onItemsPerPageChange(20);

    expect(component.itemsPerPage()).toBe(20);
    expect(component.currentPage()).toBe(1);
  });

  it('should calculate total pages correctly', () => {
    component.selectedSeasonYear.set(2024);
    component.itemsPerPage.set(2);

    expect(component.totalPages()).toBe(2);
  });

  it('should calculate total count correctly', () => {
    component.selectedSeasonYear.set(2024);

    expect(component.totalCount()).toBe(3);
  });

  it('should toggle menu', () => {
    component.menuOpen.set(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);

    component.toggleMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('should close menu', () => {
    component.menuOpen.set(true);
    component.closeMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('should return 0 when sportId is null (Number() conversion)', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(SportDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.sportId()).toBe(0);
    expect(newComponent.sport()).toBe(null);
  });

  it('should return null when sport is not found', () => {
    const id99RouteMock = {
      paramMap: of({ get: (_key: string) => '99' }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(SportDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.sportId()).toBe(99);
    expect(newComponent.sport()).toBe(null);
  });
});
