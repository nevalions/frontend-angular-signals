import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { SportEditComponent } from './sport-edit.component';
import { SportStoreService } from '../../services/sport-store.service';
import { Sport } from '../../models/sport.model';

describe('SportEditComponent', () => {
  let component: SportEditComponent;
  let fixture: ComponentFixture<SportEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: { pipe: ReturnType<typeof vi.fn> } };
  let storeMock: { sports: ReturnType<typeof vi.fn>; updateSport: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    const mockPipe = vi.fn().mockImplementation((callback) => of(callback({ get: (_key: string) => '1' })));

    routeMock = {
      paramMap: {
        pipe: mockPipe,
      },
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      sports: vi.fn().mockReturnValue([
        { id: 1, title: 'Football', description: 'Association football' } as Sport,
        { id: 2, title: 'Basketball', description: 'Basketball game' } as Sport,
      ]),
      updateSport: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SportStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(SportEditComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have sportForm with required fields', () => {
    expect(component.sportForm).toBeDefined();
    expect(component.sportForm.get('title')).toBeDefined();
    expect(component.sportForm.get('description')).toBeDefined();
  });

  it('should find sport by id from store', () => {
    const sport = component.sport();

    expect(sport).toEqual({ id: 1, title: 'Football', description: 'Association football' });
  });

  it('should patch form with sport data', () => {
    expect(component.sportForm.get('title')?.value).toBe('Football');
    expect(component.sportForm.get('description')?.value).toBe('Association football');
  });

  it('should require title field', () => {
    component.sportForm.setValue({ title: '', description: '' });

    expect(component.sportForm.get('title')?.hasError('required')).toBe(true);
  });

  it('should allow empty description', () => {
    component.sportForm.setValue({ title: 'Football', description: '' });

    expect(component.sportForm.valid).toBe(true);
  });

  it('should have valid form with all fields filled', () => {
    component.sportForm.setValue({ title: 'Football', description: 'Association football' });

    expect(component.sportForm.valid).toBe(true);
  });

  it('should navigate to sport detail on cancel', () => {
    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', '1']);
  });

  it('should call updateSport on valid form submit', () => {
    component.sportForm.setValue({ title: 'Basketball', description: 'Basketball game' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updateSport).toHaveBeenCalledWith(1, {
      title: 'Basketball',
      description: 'Basketball game',
    });
  });

  it('should not call updateSport on invalid form submit', () => {
    component.sportForm.setValue({ title: '', description: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updateSport).not.toHaveBeenCalled();
  });

  it('should show alert on successful update', () => {
    component.sportForm.setValue({ title: 'Basketball', description: 'Basketball game' });
    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalledWith('Sport updated successfully', expect.any(Object));
  });

  it('should navigate to sport detail after successful update', () => {
    component.sportForm.setValue({ title: 'Basketball', description: 'Basketball game' });
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', '1']);
  });

  it('should return null when sportId is null', () => {
    const mockPipeNull = vi.fn().mockImplementation((callback) => of(callback({ get: (_key: string) => null })));
    const nullRouteMock = {
      paramMap: {
        pipe: mockPipeNull,
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: SportStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(SportEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.sportId()).toBe(0);
    expect(newComponent.sport()).toBe(null);
  });

  it('should return null when sport is not found', () => {
    const mockPipe99 = vi.fn().mockImplementation((callback) => of(callback({ get: (key: string) => (key === 'id' ? '99' : null) })));
    const id99RouteMock = {
      paramMap: {
        pipe: mockPipe99,
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: SportStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(SportEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.sportId()).toBe(99);
    expect(newComponent.sport()).toBe(null);
  });
});
