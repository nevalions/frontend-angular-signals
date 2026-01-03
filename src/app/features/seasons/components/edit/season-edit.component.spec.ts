import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SeasonEditComponent } from './season-edit.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

describe('SeasonEditComponent', () => {
  let component: SeasonEditComponent;
  let fixture: ComponentFixture<SeasonEditComponent>;
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
      updateSeason: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
      imports: [ReactiveFormsModule, FormsModule],
    });

    fixture = TestBed.createComponent(SeasonEditComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to detail on cancel', () => {
    component.navigateToDetail();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });

  it('should call updateSeason on valid form submit', () => {
    component.seasonForm.setValue({
      year: 2025,
      description: 'Updated season',
    });

    component.onSubmit();

    expect(storeMock.updateSeason).toHaveBeenCalledWith(1, {
      year: 2025,
      description: 'Updated season',
    });
  });

  it('should not call updateSeason on invalid form submit', () => {
    component.seasonForm.setValue({
      year: 1800,
      description: 'Invalid year',
    });

    component.onSubmit();

    expect(storeMock.updateSeason).not.toHaveBeenCalled();
  });
});
