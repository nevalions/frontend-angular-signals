import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SeasonDetailComponent } from './season-detail.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

describe('SeasonDetailComponent', () => {
  let component: SeasonDetailComponent;
  let fixture: ComponentFixture<SeasonDetailComponent>;
  let routerMock: any;
  let routeMock: any;
  let storeMock: any;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (key: string) => (key === 'id' ? '1' : null) }),
    };

    storeMock = {
      seasons: vi.fn().mockReturnValue([
        { id: 1, year: 2024, description: 'Test season' } as Season,
      ]),
      deleteSeason: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SeasonStoreService, useValue: storeMock },
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

  it('should delete season on button click', () => {
    window.confirm = vi.fn(() => true);

    component.deleteSeason();

    expect(storeMock.deleteSeason).toHaveBeenCalledWith(1);
  });
});
