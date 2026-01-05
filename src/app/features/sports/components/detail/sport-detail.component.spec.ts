import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SportDetailComponent } from './sport-detail.component';
import { SportStoreService } from '../../services/sport-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { Sport } from '../../models/sport.model';

describe('SportDetailComponent', () => {
  let component: SportDetailComponent;
  let fixture: ComponentFixture<SportDetailComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }> };
  let sportStoreMock: { sports: ReturnType<typeof vi.fn>; getTournamentsBySport: ReturnType<typeof vi.fn> };
  let seasonStoreMock: { seasons: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
    };

    sportStoreMock = {
      sports: vi.fn().mockReturnValue([
        { id: 1, title: 'Football', description: 'Soccer sport' } as Sport,
        { id: 2, title: 'Basketball', description: 'Basketball sport' } as Sport,
      ]),
      getTournamentsBySport: vi.fn().mockReturnValue(of(undefined)),
    };

    seasonStoreMock = {
      seasons: vi.fn().mockReturnValue([
        { id: 1, year: 2024, description: 'Season 2024' },
        { id: 2, year: 2025, description: 'Season 2025' },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: SeasonStoreService, useValue: seasonStoreMock },
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

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports']);
  });

  it('should navigate to tournaments on season item click', () => {
    component.navigateToTournaments(2024);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments']);
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
      ],
    });

    const newFixture = TestBed.createComponent(SportDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.sportId()).toBe(99);
    expect(newComponent.sport()).toBe(null);
  });
});
