import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SeasonCreateComponent } from './season-create.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { of } from 'rxjs';

describe('SeasonCreateComponent', () => {
  let component: SeasonCreateComponent;
  let fixture: ComponentFixture<SeasonCreateComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let storeMock: { createSeason: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    storeMock = {
      createSeason: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(SeasonCreateComponent);
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

  it('should navigate to list on cancel', () => {
    component.navigateToList();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should call createSeason on valid form submit', () => {
    component.seasonForm.setValue({ year: '2024', description: 'Test season' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createSeason).toHaveBeenCalledWith({
      year: 2024,
      description: 'Test season',
    });
  });

  it('should not call createSeason on invalid form submit', () => {
    component.seasonForm.setValue({ year: '1800', description: 'Invalid year' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });

  it('should navigate to list after successful creation', () => {
    component.seasonForm.setValue({ year: '2024', description: 'Test season' });
    fixture.detectChanges();

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should handle year validation - min 1900', () => {
    component.seasonForm.setValue({ year: '1899', description: '' });
    fixture.detectChanges();

    const yearControl = component.seasonForm.get('year');
    expect(yearControl?.valid).toBe(false);
    expect(yearControl?.errors?.['min']).toBeDefined();
  });

  it('should handle year validation - max 2999', () => {
    component.seasonForm.setValue({ year: '3000', description: '' });
    fixture.detectChanges();

    const yearControl = component.seasonForm.get('year');
    expect(yearControl?.valid).toBe(false);
    expect(yearControl?.errors?.['max']).toBeDefined();
  });

  it('should accept valid year within range', () => {
    component.seasonForm.setValue({ year: '2024', description: '' });
    fixture.detectChanges();

    const yearControl = component.seasonForm.get('year');
    expect(yearControl?.valid).toBe(true);
  });

  it('should require year field', () => {
    component.seasonForm.setValue({ year: '', description: '' });
    fixture.detectChanges();

    const yearControl = component.seasonForm.get('year');
    expect(yearControl?.hasError('required')).toBe(true);
  });

  it('should allow empty description', () => {
    component.seasonForm.setValue({ year: '2024', description: '' });
    fixture.detectChanges();

    const descControl = component.seasonForm.get('description');
    expect(descControl?.valid).toBe(true);
  });

  it('should not call createSeason when form is invalid', () => {
    component.seasonForm.setValue({ year: '', description: '' });
    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });

  it('should not navigate when form is invalid', () => {
    component.seasonForm.setValue({ year: '', description: '' });
    component.onSubmit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
