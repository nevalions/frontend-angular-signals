import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PersonEditComponent } from './person-edit.component';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('PersonEditComponent', () => {
  let component: PersonEditComponent;
  let fixture: ComponentFixture<PersonEditComponent>;
  let navHelperMock: { toPersonsList: ReturnType<typeof vi.fn>; toPersonEdit: ReturnType<typeof vi.fn> };
  let routeMock: ActivatedRoute;
  let storeMock: { persons: ReturnType<typeof vi.fn>; loading: ReturnType<typeof vi.fn>; updatePerson: ReturnType<typeof vi.fn>; uploadPersonPhoto: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toPersonsList: vi.fn(),
      toPersonEdit: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
      queryParamMap: of({ get: () => null }),
    } as unknown as ActivatedRoute;

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next(true);
        subscriber.complete();
      })),
    };

    storeMock = {
      persons: vi.fn().mockReturnValue([
        { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, person_eesl_id: null, person_dob: null, isprivate: false } as Person,
        { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/jane.jpg', person_eesl_id: null, person_dob: null, isprivate: false } as Person,
      ]),
      loading: vi.fn().mockReturnValue(false),
      updatePerson: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next(undefined);
        subscriber.complete();
      })),
      uploadPersonPhoto: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next({ webview: 'api/persons/new-photo.jpg' });
        subscriber.complete();
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(PersonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

    expect(person).toEqual({ id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, person_eesl_id: null, person_dob: null, isprivate: false });
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
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [textFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(alertsMock.open).toHaveBeenCalledWith('Please select an image file', expect.any(Object));
  });

  it('should show error for file larger than 5MB', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const event = { target: { files: [largeFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(alertsMock.open).toHaveBeenCalledWith('File size must be less than 5MB', expect.any(Object));
  });

  it('should upload photo and set preview on valid file', () => {
    const validFile = new File(['test'], 'test.png', { type: 'image/png' });
    const event = { target: { files: [validFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(storeMock.uploadPersonPhoto).toHaveBeenCalledWith(validFile);
    expect(component.photoPreviewUrl()).toBe('http://localhost:9000/api/persons/new-photo.jpg');
  });

  it('should display current photo when no new photo uploaded', () => {
    expect(component.displayPhotoUrl()).toBe(null);
  });

  it('should display new photo preview when new photo uploaded', () => {
    component.photoPreviewUrl.set('http://localhost:9000/api/persons/new-photo.jpg');

    expect(component.displayPhotoUrl()).toBe('http://localhost:9000/api/persons/new-photo.jpg');
  });

  it('should navigate to list on cancel', () => {
    component.cancel();

    expect(navHelperMock.toPersonsList).toHaveBeenCalled();
  });

  it('should call updatePerson with new photo URL on valid form submit', () => {
    component.photoPreviewUrl.set('http://localhost:9000/api/persons/new-photo.jpg');
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).toHaveBeenCalledWith(
      1,
      {
        first_name: 'John',
        second_name: 'Doe',
        person_photo_url: 'api/persons/new-photo.jpg',
      }
    );
  });

  it('should call updatePerson without photo URL when no new photo uploaded', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.updatePerson).toHaveBeenCalledWith(
      1,
      {
        first_name: 'John',
        second_name: 'Doe',
      }
    );
  });

  it('should not call updatePerson on invalid form submit', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_eesl_id: null, person_dob: '' });

    component.onSubmit();

    expect(storeMock.updatePerson).not.toHaveBeenCalled();
  });

  it('should show alert on successful update', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });

    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalled();
  });

  it('should navigate to list after successful update', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });

    component.onSubmit();

    expect(navHelperMock.toPersonsList).toHaveBeenCalled();
  });

  it('should return null when personId is null', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
      queryParamMap: of({ get: () => null }),
    } as unknown as ActivatedRoute;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(PersonEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(null);
    expect(newComponent.person()).toBe(null);
  });

  it('should return null when person is not found', () => {
    const id99RouteMock = {
      paramMap: of({ get: (key: string) => (key === 'id' ? '99' : null) }),
      queryParamMap: of({ get: () => null }),
    } as unknown as ActivatedRoute;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
      ],
      imports: [],
    });

    const newFixture = TestBed.createComponent(PersonEditComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(99);
    expect(newComponent.person()).toBe(null);
  });
});
