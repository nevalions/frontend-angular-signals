import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { PersonDetailComponent } from './person-detail.component';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';

describe('PersonDetailComponent', () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let navHelperMock: { toPersonsList: ReturnType<typeof vi.fn>; toPersonEdit: ReturnType<typeof vi.fn> };
  let routeMock: { paramMap: Observable<{ get: (_key: string) => string | null }>; queryParamMap: Observable<{ get: () => string | null }> };
  let storeMock: { persons: ReturnType<typeof vi.fn>; deletePerson: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };
  let dialogsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    navHelperMock = {
      toPersonsList: vi.fn(),
      toPersonEdit: vi.fn(),
    };

    routeMock = {
      paramMap: of({ get: (_key: string) => '1' }),
      queryParamMap: of({ get: () => null }),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    dialogsMock = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    storeMock = {
      persons: vi.fn().mockReturnValue([
        { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null } as Person,
        { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/jane.jpg' } as Person,
      ]),
      deletePerson: vi.fn().mockReturnValue(of(undefined)),
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

    expect(person).toEqual({ id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null });
  });

  it('should return null when personId is null', () => {
    const nullRouteMock = {
      paramMap: of({ get: (_key: string) => null }),
      queryParamMap: of({ get: () => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
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
      paramMap: of({ get: (key: string) => (key === 'id' ? '99' : null) }),
      queryParamMap: of({ get: () => null }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: id99RouteMock },
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
