import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonListComponent } from './person-list.component';
import { PersonStoreService } from '../../services/person-store.service';
import type { TuiSortChange, TuiTablePaginationEvent } from '@taiga-ui/addon-table';

describe('PersonListComponent', () => {
  let component: PersonListComponent;
  let fixture: ComponentFixture<PersonListComponent>;
  let storeMock: {
    persons: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const mockPersons = [
    { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null },
    { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/photo.jpg' },
    { id: 3, first_name: 'Bob', second_name: 'Johnson', person_photo_url: null },
  ];

  beforeEach(async () => {
    storeMock = {
      persons: vi.fn(() => mockPersons),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      imports: [PersonListComponent],
      providers: [
        { provide: PersonStoreService, useValue: storeMock },
      ],
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(PersonListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default pagination values', () => {
    expect(component.page()).toBe(0);
    expect(component.size()).toBe(10);
    expect(component.sortBy()).toBe('second_name');
    expect(component.sortDirection()).toBe(1);
  });

  it('should expose persons from store', () => {
    const persons = component.persons();
    expect(persons).toEqual(mockPersons);
  });

  it('should expose loading state from store', () => {
    expect(component.loading()).toBe(false);
  });

  it('should expose error state from store', () => {
    expect(component.error()).toBe(null);
  });

  it('should have itemsPerPageOptions', () => {
    expect(component['itemsPerPageOptions']).toEqual([10, 20, 50]);
  });

  it('should have columns defined', () => {
    expect(component['columns']).toEqual(['first_name', 'second_name', 'person_photo_url']);
  });

  describe('Sorting', () => {
    it('should sort by second name in ascending order by default', () => {
      const sorted = component.sortedPersons();
      expect(sorted[0].second_name).toBe('Doe');
      expect(sorted[1].second_name).toBe('Johnson');
      expect(sorted[2].second_name).toBe('Smith');
    });

    it('should sort by second name in descending order', () => {
      component.sortDirection.set(-1);
      const sorted = component.sortedPersons();
      expect(sorted[0].second_name).toBe('Smith');
      expect(sorted[1].second_name).toBe('Johnson');
      expect(sorted[2].second_name).toBe('Doe');
    });

    it('should sort by first name', () => {
      component.sortBy.set('first_name');
      const sorted = component.sortedPersons();
      expect(sorted[0].first_name).toBe('Bob');
      expect(sorted[1].first_name).toBe('Jane');
      expect(sorted[2].first_name).toBe('John');
    });

    it('should handle onSortChange event', () => {
      const sortChangeEvent = {
        sortKey: 'first_name' as const,
        sortDirection: -1 as const,
      } as TuiSortChange<typeof mockPersons[0]>;

      component.onSortChange(sortChangeEvent);

      expect(component.sortBy()).toBe('first_name');
      expect(component.sortDirection()).toBe(-1);
    });
  });

  describe('Pagination', () => {
    it('should handle onPaginationChange event', () => {
      const paginationEvent: TuiTablePaginationEvent = {
        page: 2,
        size: 20,
      };

      component.onPaginationChange(paginationEvent);

      expect(component.page()).toBe(2);
      expect(component.size()).toBe(20);
    });

    it('should handle onPaginationChange with new page only', () => {
      const paginationEvent: TuiTablePaginationEvent = {
        page: 1,
        size: 10,
      };

      component.onPaginationChange(paginationEvent);

      expect(component.page()).toBe(1);
      expect(component.size()).toBe(10);
    });
  });

  describe('Signal Computed Properties', () => {
    it('should compute sortedPersons correctly', () => {
      const sorted = component.sortedPersons();
      expect(sorted).toHaveLength(3);
      expect(sorted[0].second_name).toBe('Doe');
    });

    it('should return unsorted persons when sortBy is null', () => {
      component.sortBy.set(null);
      const sorted = component.sortedPersons();
      expect(sorted).toEqual(mockPersons);
    });
  });
});
