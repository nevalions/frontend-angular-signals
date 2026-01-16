import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SeasonDetailComponent } from './season-detail.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';

describe('SeasonDetailComponent', () => {
  let component: SeasonDetailComponent;
  let fixture: ComponentFixture<SeasonDetailComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }>; queryParamMap: Observable<{ get: () => string | null }> };
  let storeMock: { seasons: ReturnType<typeof vi.fn>; deleteSeason: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
      queryParamMap: of({ get: () => null }),
    };

    storeMock = {
      seasons: vi.fn().mockReturnValue([
        { id: 1, year: 2024, description: 'Test season' } as Season,
        { id: 2, year: 2025, description: 'Another season' } as Season,
      ]),
      deleteSeason: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SeasonStoreService, useValue: storeMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: TuiAlertService, useValue: { open: vi.fn() } },
      ],
    });

    fixture = TestBed.createComponent(SeasonDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back on button click', () => {
    component.navigateBack();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should navigate to edit on button click', () => {
    component.navigateToEdit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1, 'edit']);
  });

  it('should navigate to tournaments on link click', () => {
    component.navigateToTournaments();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 'year', 2024, 'tournaments']);
  });

  it('should navigate to teams on link click', () => {
    component.navigateToTeams();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 'year', 2024, 'teams']);
  });

  it('should navigate to matches on link click', () => {
    component.navigateToMatches();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 'year', 2024, 'matches']);
  });

  it('should delete season on button click with confirmation', () => {
    component.deleteSeason();

    expect(dialogsMock.open).toHaveBeenCalled();
    expect(storeMock.deleteSeason).toHaveBeenCalledWith(1);
  });

  it('should not delete season when confirmation is cancelled', () => {
    dialogsMock.open.mockReturnValueOnce(of(false));

    component.deleteSeason();

    expect(dialogsMock.open).toHaveBeenCalled();
    expect(storeMock.deleteSeason).not.toHaveBeenCalled();
  });

  it('should find season by id from store', () => {
    const season = component.season();

    expect(season).toEqual({ id: 1, year: 2024, description: 'Test season' });
  });

  it('should return 0 when seasonId is null (Number() conversion)', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
      queryParamMap: of({ get: () => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
    });

    const newFixture = TestBed.createComponent(SeasonDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.seasonId()).toBe(0);
    expect(newComponent.season()).toBe(null);
  });

  it('should return null when season is not found', () => {
    const id99RouteMock = {
      paramMap: of({ get: (key: string) => (key === 'id' ? '99' : null) }),
      queryParamMap: of({ get: () => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
    });

    const newFixture = TestBed.createComponent(SeasonDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.seasonId()).toBe(99);
    expect(newComponent.season()).toBe(null);
  });
});
