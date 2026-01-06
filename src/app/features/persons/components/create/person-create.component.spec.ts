import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { PersonCreateComponent } from './person-create.component';
import { PersonStoreService } from '../../services/person-store.service';

describe('PersonCreateComponent', () => {
  let component: PersonCreateComponent;
  let fixture: ComponentFixture<PersonCreateComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let storeMock: { createPerson: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let fb: FormBuilder;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      createPerson: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(PersonCreateComponent);
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

  it('should call createPerson on valid form submit', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_photo: null });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createPerson).toHaveBeenCalledWith({
      first_name: 'John',
      second_name: 'Doe',
    });
  });

  it('should not call createPerson on invalid form submit', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_photo: null });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createPerson).not.toHaveBeenCalled();
  });

  it('should show alert on successful creation', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_photo: null });
    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalledWith('Person created successfully', expect.any(Object));
  });

  it('should navigate to list after successful creation', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_photo: null });
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });
});
