import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { PersonCreateComponent } from './person-create.component';
import { PersonStoreService } from '../../services/person-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('PersonCreateComponent', () => {
  let component: PersonCreateComponent;
  let fixture: ComponentFixture<PersonCreateComponent>;
  let navHelperMock: { toPersonsList: ReturnType<typeof vi.fn> };
  let storeMock: { createPerson: ReturnType<typeof vi.fn>; uploadPersonPhoto: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toPersonsList: vi.fn(),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      createPerson: vi.fn().mockReturnValue(of(undefined)),
      uploadPersonPhoto: vi.fn().mockReturnValue(of({ webview: 'api/persons/photo.jpg' })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
        FormBuilder,
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(PersonCreateComponent);
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
    expect(component.photoPreviewUrl()).toBe('http://localhost:9000/api/persons/photo.jpg');
  });

  it('should set loading state during photo upload', () => {
    const validFile = new File(['test'], 'test.png', { type: 'image/png' });
    const event = { target: { files: [validFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.photoUploadLoading()).toBe(false);
  });

  it('should call createPerson with photo URL on valid form submit', () => {
    component.photoPreviewUrl.set('http://localhost:9000/api/persons/photo.jpg');
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createPerson).toHaveBeenCalledWith({
      first_name: 'John',
      second_name: 'Doe',
      person_photo_url: 'api/persons/photo.jpg',
      person_eesl_id: null,
      person_dob: null,
    });
  });

  it('should call createPerson without photo URL when no photo uploaded', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createPerson).toHaveBeenCalledWith({
      first_name: 'John',
      second_name: 'Doe',
      person_photo_url: null,
      person_eesl_id: null,
      person_dob: null,
    });
  });

  it('should not call createPerson on invalid form submit', () => {
    component.personForm.setValue({ first_name: '', second_name: '', person_eesl_id: null, person_dob: '' });
    fixture.detectChanges();

    component.onSubmit();

    expect(storeMock.createPerson).not.toHaveBeenCalled();
  });

  it('should show alert on successful creation', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    component.onSubmit();

    expect(alertsMock.open).toHaveBeenCalledWith('Person created successfully', expect.any(Object));
  });

  it('should navigate to list after successful creation', () => {
    component.personForm.setValue({ first_name: 'John', second_name: 'Doe', person_eesl_id: null, person_dob: '' });
    component.onSubmit();

    expect(navHelperMock.toPersonsList).toHaveBeenCalled();
  });
});
