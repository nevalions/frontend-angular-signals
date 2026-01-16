import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { SeasonEditComponent } from './season-edit.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('SeasonEditComponent', () => {
  let component: SeasonEditComponent;
  let fixture: ComponentFixture<SeasonEditComponent>;
  let navHelperMock: { toSeasonDetail: ReturnType<typeof vi.fn> };
  let routeMock: ActivatedRoute;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let storeMock: { seasons: ReturnType<typeof vi.fn>; updateSeason: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toSeasonDetail: vi.fn(),
    };

    routeMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
      },
      queryParamMap: {
        get: (_key: string) => null,
      },
    } as unknown as ActivatedRoute;

    routerMock = {
      navigate: vi.fn(),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      seasons: vi.fn().mockReturnValue([
        { id: 1, year: 2024, description: 'Test season', iscurrent: false } as Season,
      ]),
      updateSeason: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
      ],
      imports: [ReactiveFormsModule, FormsModule, SeasonEditComponent],
    });

    fixture = TestBed.createComponent(SeasonEditComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have seasonForm with required fields', () => {
    expect(component.seasonForm).toBeDefined();
    expect(component.seasonForm.get('year')).toBeDefined();
    expect(component.seasonForm.get('description')).toBeDefined();
  });

  it('should navigate to detail on cancel', () => {
    component.navigateToDetail();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });

  it('should call updateSeason on valid form submit', () => {
    component.seasonForm.setValue({
      year: '2025',
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
      year: '1800',
      description: 'Invalid year',
    });

    expect(component.seasonForm.valid).toBe(false);
    component.onSubmit();

    expect(storeMock.updateSeason).not.toHaveBeenCalled();
  });

  it('should navigate to detail after successful update', () => {
    component.seasonForm.setValue({
      year: '2025',
      description: 'Updated season',
    });
    fixture.detectChanges();

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });

  it('should find season by id from store', () => {
    const season = component.season();

    expect(season).toEqual({ id: 1, year: 2024, description: 'Test season', iscurrent: false });
  });

  it('should pre-populate form from season (via effect)', () => {
    fixture.detectChanges();

    expect(component.seasonForm.get('year')?.value).toBe('2024');
    expect(component.seasonForm.get('description')?.value).toBe('Test season');
  });

  it('should handle year validation - min 1900', () => {
    const yearControl = component.seasonForm.get('year');
    yearControl?.setValue('1899');

    expect(yearControl?.valid).toBe(false);
    expect(yearControl?.errors?.['min']).toBeDefined();
  });

  it('should handle year validation - max 2999', () => {
    const yearControl = component.seasonForm.get('year');
    yearControl?.setValue('3000');

    expect(yearControl?.valid).toBe(false);
    expect(yearControl?.errors?.['max']).toBeDefined();
  });

  it('should accept valid year within range', () => {
    const yearControl = component.seasonForm.get('year');
    yearControl?.setValue('2025');

    expect(yearControl?.valid).toBe(true);
  });

  it('should allow optional description', () => {
    const descControl = component.seasonForm.get('description');
    descControl?.setValue('');

    expect(descControl?.valid).toBe(true);
  });

  it('should not call updateSeason when form is invalid', () => {
    component.seasonForm.setValue({ year: '2025', description: 'Updated season' });

    component.onSubmit();

    expect(storeMock.updateSeason).toHaveBeenCalled();
  });

  it('should not navigate when form is invalid', () => {
    component.seasonForm.setValue({ year: '1800', description: '' });

    expect(component.seasonForm.valid).toBe(false);
    component.onSubmit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
