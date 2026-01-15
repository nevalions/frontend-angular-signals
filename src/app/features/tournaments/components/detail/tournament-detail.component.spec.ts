import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TournamentDetailComponent } from './tournament-detail.component';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('TournamentDetailComponent', () => {
  let component: TournamentDetailComponent;
  let fixture: ComponentFixture<TournamentDetailComponent>;
  let navHelperMock: { toSportDetail: ReturnType<typeof vi.fn>; toTournamentEdit: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };
  let tournamentStoreMock: { tournaments: ReturnType<typeof vi.fn>; loading: ReturnType<typeof vi.fn>; deleteTournament: ReturnType<typeof vi.fn> };
  let seasonStoreMock: { seasons: ReturnType<typeof vi.fn>; seasonByYear: ReturnType<typeof vi.fn> };
  let sportStoreMock: { sports: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toSportDetail: vi.fn(),
      toTournamentEdit: vi.fn(),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    tournamentStoreMock = {
      tournaments: vi.fn().mockReturnValue([
        { id: 1, title: 'Premier League', description: 'Top division', sport_id: 1, season_id: 1 },
        { id: 2, title: 'FA Cup', description: 'Domestic cup', sport_id: 1, season_id: 1 },
      ]),
      loading: vi.fn().mockReturnValue(false),
      deleteTournament: vi.fn().mockReturnValue(of(void 0)),
    };

    const season2024 = { id: 1, year: 2024, description: 'Season 2024' };
    const seasonMap = new Map<number, typeof season2024>([
      [2024, season2024],
    ]);

    seasonStoreMock = {
      seasons: vi.fn().mockReturnValue([season2024]),
      seasonByYear: vi.fn().mockReturnValue(seasonMap),
    };

    sportStoreMock = {
      sports: vi.fn().mockReturnValue([
        { id: 1, title: 'Football', description: 'Soccer sport' },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: (_key: string) => '1' }) } },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    fixture = TestBed.createComponent(TournamentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default activeTab as matches', () => {
    expect(component.activeTab()).toBe('matches');
  });

  it('should change tab', () => {
    component.onTabChange('teams');
    expect(component.activeTab()).toBe('teams');

    component.onTabChange('players');
    expect(component.activeTab()).toBe('players');
  });

  it('should navigate back on button click', () => {
    component.navigateBack();
    expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1, 2024);
  });

  it('should find tournament by id from store', () => {
    const tournament = component.tournament();
    expect(tournament).toEqual({ id: 1, title: 'Premier League', description: 'Top division', sport_id: 1, season_id: 1 });
  });

  it('should find sport by id from store', () => {
    const sport = component.sport();
    expect(sport).toEqual({ id: 1, title: 'Football', description: 'Soccer sport' });
  });

  it('should find season by year from store', () => {
    const season = component.season();
    expect(season).toEqual({ id: 1, year: 2024, description: 'Season 2024' });
  });

  it('should expose loading state from store', () => {
    expect(component.loading()).toBe(false);
  });

  it('should return null when tournamentId is null (Number() conversion)', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(TournamentDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.tournamentId()).toBe(0);
    expect(newComponent.tournament()).toBe(null);
  });

  it('should return null when tournament is not found', () => {
    const id99RouteMock = {
      paramMap: of({ get: (_key: string) => '99' }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: TournamentStoreService, useValue: tournamentStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(TournamentDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.tournamentId()).toBe(99);
    expect(newComponent.tournament()).toBe(null);
  });
});
