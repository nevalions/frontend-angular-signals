import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SeasonCreateComponent } from './season-create.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { of } from 'rxjs';

describe('SeasonCreateComponent', () => {
  let component: SeasonCreateComponent;
  let fixture: ComponentFixture<SeasonCreateComponent>;
  let routerMock: any;
  let storeMock: any;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    storeMock = {
      createSeason: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
      imports: [ReactiveFormsModule, FormsModule],
    });

    fixture = TestBed.createComponent(SeasonCreateComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.seasonForm.invalid).toBe(true);
  });

  it('should navigate to list on cancel', () => {
    component.navigateToList();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should call createSeason on valid form submit', () => {
    component.seasonForm.setValue({
      year: 2024,
      description: 'Test season',
    });

    component.onSubmit();

    expect(storeMock.createSeason).toHaveBeenCalledWith({
      year: 2024,
      description: 'Test season',
    });
  });

  it('should not call createSeason on invalid form submit', () => {
    component.seasonForm.setValue({
      year: 1800,
      description: 'Invalid year',
    });

    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });

  it('should navigate to list after successful creation', () => {
    component.seasonForm.setValue({
      year: 2024,
      description: 'Test season',
    });

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
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
    component.yearControl?.setValue(2024);

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
});
