import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SeasonEditComponent } from './season-edit.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

describe('SeasonEditComponent', () => {
  let component: SeasonEditComponent;
  let fixture: ComponentFixture<SeasonEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }> };
  let storeMock: { seasons: ReturnType<typeof vi.fn>; updateSeason: ReturnType<typeof vi.fn> };

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
      updateSeason: vi.fn().mockReturnValue(of(undefined)),
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

  it('should navigate to detail after successful update', () => {
    component.seasonForm.setValue({
      year: 2025,
      description: 'Updated season',
    });

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });

  it('should find season by id from store', () => {
    const season = component.season();

    expect(season).toEqual({ id: 1, year: 2024, description: 'Test season' });
  });

  it('should pre-populate form from season (via effect)', () => {
    fixture.detectChanges();

    expect(component.seasonForm.value.year).toBe(2024);
    expect(component.seasonForm.value.description).toBe('Test season');
  });

  it('should handle year validation - min 1900', () => {
    component.yearControl?.setValue(1899);

    expect(component.yearControl?.valid).toBe(false);
    expect(component.yearControl?.errors?.['min']).toBeDefined();
  });

  it('should handle year validation - max 2999', () => {
    component.yearControl?.setValue(3000);

    expect(component.yearControl?.valid).toBe(false);
    expect(component.yearControl?.errors?.['max']).toBeDefined();
  });

  it('should accept valid year within range', () => {
    component.yearControl?.setValue(2025);

    expect(component.yearControl?.valid).toBe(true);
  });

  it('should require year field', () => {
    component.yearControl?.setValue('');

    expect(component.yearControl?.hasError('required')).toBe(true);
  });

  it('should allow optional description', () => {
    component.descriptionControl?.setValue('');

    expect(component.descriptionControl?.valid).toBe(true);
  });

  it('should provide yearControl accessor', () => {
    expect(component.yearControl).toBeDefined();
    expect(component.yearControl).toBe(component.seasonForm.get('year'));
  });

  it('should provide descriptionControl accessor', () => {
    expect(component.descriptionControl).toBeDefined();
    expect(component.descriptionControl).toBe(component.seasonForm.get('description'));
  });

  it('should not call updateSeason when form is invalid', () => {
    component.yearControl?.setValue(1900);
    component.yearControl?.setValue('');

    component.onSubmit();

    expect(storeMock.updateSeason).not.toHaveBeenCalled();
  });

  it('should not navigate when form is invalid', () => {
    component.yearControl?.setValue('');
    component.descriptionControl?.setValue('');

    component.onSubmit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
