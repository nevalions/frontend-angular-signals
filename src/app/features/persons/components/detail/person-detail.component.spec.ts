import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PersonDetailComponent } from './person-detail.component';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('PersonDetailComponent', () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let navHelperMock: { toPersonsList: ReturnType<typeof vi.fn>; toPersonEdit: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: { get: (_key: string) => string | null }; queryParamMap: { get: () => string | null } };
  let storeMock: { persons: ReturnType<typeof vi.fn>; deletePerson: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toPersonsList: vi.fn(),
      toPersonEdit: vi.fn(),
    };

    routeMock = {
      paramMap: { get: (_key: string) => '1' },
      queryParamMap: { get: () => null },
    };

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
        { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, isprivate: false } as Person,
        { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/jane.jpg', isprivate: false } as Person,
      ]),
      deletePerson: vi.fn().mockReturnValue(new Observable(subscriber => {
        subscriber.next();
        subscriber.complete();
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    fixture = TestBed.createComponent(PersonDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back on button click', () => {
    component.navigateBack();

    expect(navHelperMock.toPersonsList).toHaveBeenCalled();
  });

  it('should navigate to edit on button click', () => {
    component.navigateToEdit();

    expect(navHelperMock.toPersonEdit).toHaveBeenCalledWith(1);
  });

  it('should find person by id from store', () => {
    const person = component.person();

    expect(person).toEqual({ id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null, isprivate: false });
  });

  it('should return null when personId is null', () => {
    const nullRouteMock = {
      paramMap: { get: (_key: string) => null },
      queryParamMap: { get: () => null },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: ActivatedRoute, useValue: nullRouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(PersonDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(null);
    expect(newComponent.person()).toBe(null);
  });

  it('should return null when person is not found', () => {
    const id99RouteMock = {
      paramMap: { get: (key: string) => (key === 'id' ? '99' : null) },
      queryParamMap: { get: () => null },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: NavigationHelperService, useValue: navHelperMock },
        provide: ActivatedRoute, useValue: id99RouteMock },
        { provide: PersonStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    });

    const newFixture = TestBed.createComponent(PersonDetailComponent);
    const newComponent = newFixture.componentInstance;

    expect(newComponent.personId()).toBe(99);
    expect(newComponent.person()).toBe(null);
  });
});
