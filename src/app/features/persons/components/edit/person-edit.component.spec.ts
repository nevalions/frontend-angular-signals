import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { PersonEditComponent } from './person-edit.component';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';

describe('PersonEditComponent', () => {
  let component: PersonEditComponent;
  let fixture: ComponentFixture<PersonEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: { pipe: ReturnType<typeof vi.fn> } };
  let storeMock: { persons: ReturnType<typeof vi.fn>; updatePerson: ReturnType<typeof vi.fn>; uploadPersonPhoto: ReturnType<typeof vi.fn> };
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
      persons: vi.fn().mockReturnValue([
        { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, person_eesl_id: null, person_dob: null } as Person,
        { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/jane.jpg', person_eesl_id: null, person_dob: null } as Person,
      ]),
      updatePerson: vi.fn().mockReturnValue(of(undefined)),
      uploadPersonPhoto: vi.fn().mockReturnValue(of({ webview: 'http://test.com/new-photo.jpg' })),
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
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have personForm with required fields', () => {
    expect(component.personForm).toBeDefined();
    expect(component.personForm.get('first_name')).toBeDefined();
    expect(component.personForm.get('second_name')).toBeDefined();
    expect(component.personForm.get('person_eesl_id')).toBeDefined();
    expect(component.personForm.get('person_dob')).toBeDefined();
  });

  it('should find person by id from store', () => {
    const person = component.person();

    expect(person).toEqual({ id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, person_eesl_id: null, person_dob: null });
  });

  it('should patch form with person data', () => {
    expect(component.personForm.get('first_name')?.value).toBe('John');
    expect(component.personForm.get('second_name')?.value).toBe('Doe');
  });

  it('should require first_name field', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_eesl_id: null, person_dob: '' });

    expect(component.personForm.get('first_name')?.hasError('required')).toBe(true);
  });

  it('should allow empty second_name', () => {
    component.personForm.setValue({ first_name: 'John', second_name: '', person_eesl_id: null, person_dob: '' });

    expect(component.personForm.valid).toBe(true);
  });

  it('should have valid form with all fields filled', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });

    expect(component.personForm.valid).toBe(true);
  });

  it('should have photoUploadLoading signal', () => {
    expect(component.photoUploadLoading).toBeDefined();
  });

  it('should have photoPreviewUrl signal', () => {
    expect(component.photoPreviewUrl).toBeDefined();
  });

  it('should have currentPhotoUrl computed', () => {
    expect(component.currentPhotoUrl).toBeDefined();
  });

  it('should have displayPhotoUrl computed', () => {
    expect(component.displayPhotoUrl).toBeDefined();
  });

  it('should show error for non-image file', () => {
    const event = { target: { files: [new File(['test'], 'test.txt', { type: 'text/plain' })] } } as unknown as Event;

    component.onFileSelected(event);

    expect(alertsMock.open).toHaveBeenCalledWith('Please select an image file', expect.any(Object));
  });

  it('should show error for file larger than 5MB', () => {
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const event = { target: { files: [largeFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(alertsMock.open).toHaveBeenCalledWith('File size must be less than 5MB', expect.any(Object));
  });

  it('should upload photo and set preview on valid file', () => {
    const validFile = new File(['test'], 'test.png', { type: 'image/png' });
    const event = { target: { files: [validFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(storeMock.uploadPersonPhoto).toHaveBeenCalledWith(validFile);
    expect(component.photoPreviewUrl()).toBe('http://test.com/new-photo.jpg');
  });

  it('should display current photo when no new photo uploaded', () => {
    const person = component.person();
    expect(component.displayPhotoUrl()).toBe(person?.person_photo_url ?? null);
  });

  it('should display new photo preview when new photo uploaded', () => {
    component.photoPreviewUrl.set('http://test.com/new-photo.jpg');
    expect(component.displayPhotoUrl()).toBe('http://test.com/new-photo.jpg');
  });

  it('should navigate to list on cancel', () => {
    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });

  it('should call updatePerson with new photo URL on valid form submit', () => {
    component.photoPreviewUrl.set('http://test.com/new-photo.jpg');
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).toHaveBeenCalledWith(1, {
      first_name: 'Jane',
      second_name: 'Smith',
      person_photo_url: 'http://test.com/new-photo.jpg',
      person_eesl_id: null,
      person_dob: '',
    });
  });

  it('should call updatePerson without photo URL when no new photo uploaded', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).toHaveBeenCalledWith(1, {
      first_name: 'Jane',
      second_name: 'Smith',
      person_eesl_id: null,
      person_dob: '',
    });
  });

  it('should not call updatePerson on invalid form submit', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).not.toHaveBeenCalled();
  });

  it('should show alert on successful update', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_eesl_id: null, person_dob: '' });
    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalledWith('Person updated successfully', expect.any(Object));
  });

  it('should navigate to list after successful update', () => {
    component.personForm.setValue({ first_name: 'Jane', second_name: 'Smith', person_eesl_id: null, person_dob: '' });
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });

  it('should return null when personId is null', () => {
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
