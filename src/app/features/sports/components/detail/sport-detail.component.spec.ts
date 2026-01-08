import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { SportDetailComponent } from './sport-detail.component';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { PlayerStoreService } from '../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { Sport } from '../../models/sport.model';

describe('SportDetailComponent', () => {
  let component: SportDetailComponent;
  let fixture: ComponentFixture<SportDetailComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }> };
  let sportStoreMock: { sports: ReturnType<typeof vi.fn>; deleteSport: ReturnType<typeof vi.fn> };
  let seasonStoreMock: { seasons: ReturnType<typeof vi.fn>; seasonByYear: ReturnType<typeof vi.fn> };
  let playerStoreMock: { setSportId: ReturnType<typeof vi.fn> };
  let navHelperMock: { toSportsList: ReturnType<typeof vi.fn>; toSportEdit: ReturnType<typeof vi.fn> };
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

    playerStoreMock = {
      setSportId: vi.fn(),
    };

    navHelperMock = {
      toSportsList: vi.fn(),
      toSportEdit: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: PlayerStoreService, useValue: playerStoreMock },
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

  it('should map seasons to years', () => {
    const years = component.seasonYears();

    expect(years).toEqual([2024, 2025]);
  });

  it('should call setSportId on PlayerStore when sportId changes', () => {
    expect(playerStoreMock.setSportId).toHaveBeenCalledWith(1);
  });

  it('should change tab', () => {
    component.activeTab = 'tournaments';
    component.onTabChange('players');

    expect(component.activeTab).toBe('players');
  });

  it('should delete sport with confirmation', () => {
    component.deleteSport();

    expect(dialogsMock.open).toHaveBeenCalled();
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
        { provide: PlayerStoreService, useValue: playerStoreMock },
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
        { provide: PlayerStoreService, useValue: playerStoreMock },
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
