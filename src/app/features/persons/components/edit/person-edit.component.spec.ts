import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { PersonEditComponent } from './person-edit.component';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';

describe('PersonEditComponent', () => {
  let component: PersonEditComponent;
  let fixture: ComponentFixture<PersonEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string }> };
  let storeMock: { persons: ReturnType<typeof vi.fn>; updatePerson: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let fb: FormBuilder;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      persons: vi.fn().mockReturnValue([
        { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null } as Person,
        { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/jane.jpg' } as Person,
      ]),
      updatePerson: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(PersonEditComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have personForm with required fields', () => {
    expect(component.personForm).toBeDefined();
    expect(component.personForm.get('first_name')).toBeDefined();
    expect(component.personForm.get('second_name')).toBeDefined();
    expect(component.personForm.get('person_photo')).toBeDefined();
  });

  it('should find person by id from store', () => {
    const person = component.person();

    expect(person).toEqual({ id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null });
  });

  it('should patch form with person data', () => {
    const person = component.person();

    expect(component.personForm.get('first_name')?.value).toBe('John');
    expect(component.personForm.get('second_name')?.value).toBe('Doe');
  });

  it('should require first_name field', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_photo: null });

    expect(component.personForm.get('first_name')?.hasError('required')).toBe(true);
  });

  it('should allow empty second_name', () => {
    component.personForm.setValue({ first_name: 'John', second_name: '', person_photo: null });

    expect(component.personForm.valid).toBe(true);
  });

  it('should have valid form with all fields filled', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_photo: null });

    expect(component.personForm.valid).toBe(true);
  });

  it('should navigate to list on cancel', () => {
    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });

  it('should call updatePerson on valid form submit', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_photo: null });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).toHaveBeenCalledWith(1, {
      first_name: 'Jane',
      second_name: 'Smith',
    });
  });

  it('should not call updatePerson on invalid form submit', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_photo: null });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).not.toHaveBeenCalled();
  });

  it('should show alert on successful update', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_photo: null });
    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalledWith('Person updated successfully', expect.any(Object));
  });

  it('should navigate to list after successful update', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_photo: null });
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });

  it('should return null when personId is null', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(PersonEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(0);
    expect(newComponent.person()).toBe(null);
  });

  it('should return null when person is not found', () => {
    const id99RouteMock = {
      paramMap: of({ get: (key: string) => (key === 'id' ? '99' : null) }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(PersonEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(99);
    expect(newComponent.person()).toBe(null);
  });
});
