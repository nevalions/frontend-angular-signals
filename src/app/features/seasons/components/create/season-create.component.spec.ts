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

  it('should navigate to list on cancel', () => {
    component.navigateToList();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should call createSeason on valid form submit', () => {
    component.formModel.set({ year: '2024', description: 'Test season' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createSeason).toHaveBeenCalledWith({
      year: 2024,
      description: 'Test season',
    });
  });

  it('should not call createSeason on invalid form submit', () => {
    component.formModel.set({ year: '1800', description: 'Invalid year' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });

  it('should navigate to list after successful creation', () => {
    component.formModel.set({ year: '2024', description: 'Test season' });
    fixture.detectChanges();

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('should handle year validation - min 1900', () => {
    component.formModel.set({ year: '1899', description: '' });
    fixture.detectChanges();

    const yearState = component.seasonForm.year();
    expect(yearState.invalid()).toBe(true);
  });

  it('should handle year validation - max 2999', () => {
    component.formModel.set({ year: '3000', description: '' });
    fixture.detectChanges();

    const yearState = component.seasonForm.year();
    expect(yearState.invalid()).toBe(true);
  });

  it('should accept valid year within range', () => {
    component.formModel.set({ year: '2024', description: '' });
    fixture.detectChanges();

    const yearState = component.seasonForm.year();
    expect(yearState.invalid()).toBe(false);
  });

  it('should require year field', () => {
    component.formModel.set({ year: '', description: '' });
    fixture.detectChanges();

    const yearState = component.seasonForm.year();
    expect(yearState.invalid()).toBe(true);
  });

  it('should allow empty description', () => {
    component.formModel.set({ year: '2024', description: '' });
    fixture.detectChanges();

    const descState = component.seasonForm.description();
    expect(descState.valid()).toBe(true);
  });

  it('should have seasonForm signal', () => {
    expect(component.seasonForm).toBeDefined();
  });

  it('should have formModel signal', () => {
    expect(component.formModel).toBeDefined();
  });

  it('should not call createSeason when form is invalid', () => {
    component.formModel.set({ year: '', description: '' });

    component.onSubmit();

    expect(storeMock.createSeason).not.toHaveBeenCalled();
  });

  it('should not navigate when form is invalid', () => {
    component.formModel.set({ year: '', description: '' });

    component.onSubmit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
