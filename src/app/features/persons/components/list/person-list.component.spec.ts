import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PersonListComponent } from './person-list.component';
import { PersonStoreService } from '../../services/person-store.service';

describe('PersonListComponent', () => {
  let component: PersonListComponent;
  let fixture: ComponentFixture<PersonListComponent>;
  let navHelperMock: { toPersonCreate: ReturnType<typeof vi.fn>; toPersonDetail: ReturnType<typeof vi.fn> };
  let storeMock: {
    persons: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    page: ReturnType<typeof vi.fn>;
    itemsPerPage: ReturnType<typeof vi.fn>;
    totalPages: ReturnType<typeof vi.fn>;
    totalCount: ReturnType<typeof vi.fn>;
    sortBy: ReturnType<typeof vi.fn>;
    sortOrder: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
    setSearch: ReturnType<typeof vi.fn>;
    setSort: ReturnType<typeof vi.fn>;
    setPage: ReturnType<typeof vi.fn>;
    setItemsPerPage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    navHelperMock = {
      toPersonCreate: vi.fn(),
      toPersonDetail: vi.fn(),
    };

    storeMock = {
      persons: vi.fn().mockReturnValue([]),
      loading: vi.fn().mockReturnValue(false),
      error: vi.fn().mockReturnValue(null),
      page: vi.fn().mockReturnValue(1),
      itemsPerPage: vi.fn().mockReturnValue(10),
      totalPages: vi.fn().mockReturnValue(1),
      totalCount: vi.fn().mockReturnValue(0),
      sortBy: vi.fn().mockReturnValue('first_name'),
      sortOrder: vi.fn().mockReturnValue('asc'),
      search: vi.fn().mockReturnValue(''),
      setSearch: vi.fn(),
      setSort: vi.fn(),
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: PersonStoreService, useValue: storeMock },
        FormBuilder,
      ],
      imports: [],
    });

    fixture = TestBed.createComponent(PersonListComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose persons from store', () => {
    const persons = component.persons();
    expect(persons).toEqual([]);
  });

  it('should expose loading state from store', () => {
    expect(component.loading()).toBe(false);
  });

  it('should expose error state from store', () => {
    expect(component.error()).toBe(null);
  });

  it('should expose page from store', () => {
    expect(component.page()).toBe(1);
  });

  it('should expose itemsPerPage from store', () => {
    expect(component.itemsPerPage()).toBe(10);
  });

  it('should expose totalPages from store', () => {
    expect(component.totalPages()).toBe(1);
  });

  it('should expose totalCount from store', () => {
    expect(component.totalCount()).toBe(0);
  });

  it('should expose sortBy from store', () => {
    expect(component.sortBy()).toBe('first_name');
  });

  it('should expose sortOrder from store', () => {
    expect(component.sortOrder()).toBe('asc');
  });

  it('should navigate to create on Add Person button click', () => {
    component.navigateToCreate();

    expect(navHelperMock.toPersonCreate).toHaveBeenCalled();
  });

  it('should navigate to person detail on card click', () => {
    component.navigateToPersonDetail(1);

    expect(navHelperMock.toPersonDetail).toHaveBeenCalledWith(1);
  });

  it('should set search value', () => {
    component.searchControl.setValue('John');

    expect(component.searchControl.value).toBe('John');
  });

  it('should clear search on clear button click', () => {
    component.searchControl.setValue('John');
    component.clearSearch();

    expect(component.searchControl.value).toBe('');
  });

  it('should toggle sort order when clicking same sort field', () => {
    component.toggleSort('first_name');

    expect(storeMock.setSort).toHaveBeenCalledWith('first_name', 'desc');
  });

  it('should set sort field when clicking different sort field', () => {
    component.toggleSort('second_name');

    expect(storeMock.setSort).toHaveBeenCalledWith('second_name', 'asc');
  });

  it('should set page on page change', () => {
    component.onPageChange(2);

    expect(storeMock.setPage).toHaveBeenCalledWith(3);
  });

  it('should set items per page on items per page change', () => {
    component.onItemsPerPageChange(25);

    expect(storeMock.setItemsPerPage).toHaveBeenCalledWith(25);
    expect(storeMock.setPage).toHaveBeenCalledWith(1);
  });

  it('should have searchControl', () => {
    expect(component.searchControl).toBeDefined();
    expect(component.searchControl).toBeInstanceOf(FormControl);
  });
});
