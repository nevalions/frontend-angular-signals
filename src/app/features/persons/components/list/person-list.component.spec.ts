import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonListComponent } from './person-list.component';
import { PersonStoreService } from '../../services/person-store.service';

describe('PersonListComponent', () => {
  let component: PersonListComponent;
  let fixture: ComponentFixture<PersonListComponent>;
  let storeMock: any;

  const mockPersons = [
    { id: 1, first_name: 'John', second_name: 'Doe', person_photo_url: null },
    { id: 2, first_name: 'Jane', second_name: 'Smith', person_photo_url: 'http://example.com/photo.jpg' },
    { id: 3, first_name: 'Bob', second_name: 'Johnson', person_photo_url: null },
  ];

  beforeEach(() => {
    storeMock = {
      persons: vi.fn(() => mockPersons),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PersonStoreService, useValue: storeMock },
      ],
    });

    fixture = TestBed.createComponent(PersonListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default pagination values', () => {
    expect(component.currentPage()).toBe(1);
    expect(component.itemsPerPage()).toBe(10);
    expect(component.sortBy()).toBe('second_name');
    expect(component.sortOrder()).toBe('asc');
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

  describe('Pagination', () => {
    it('should calculate total pages correctly', () => {
      expect(component.totalPages()).toBe(1);
    });

    it('should calculate total pages with more items', () => {
      const largePersonList = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        first_name: `First${i}`,
        second_name: `Last${i}`,
        person_photo_url: null,
      }));
      storeMock.persons = vi.fn(() => largePersonList);
      fixture = TestBed.createComponent(PersonListComponent);
      component = fixture.componentInstance;

      expect(component.totalPages()).toBe(3);
    });

    it('should paginate items correctly', () => {
      const largePersonList = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        first_name: `First${i}`,
        second_name: `Last${i}`,
        person_photo_url: null,
      }));
      storeMock.persons = vi.fn(() => largePersonList);
      fixture = TestBed.createComponent(PersonListComponent);
      component = fixture.componentInstance;

      expect(component.paginatedPersons().length).toBe(10);
    });

    it('should change to next page', () => {
      const largePersonList = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        first_name: `First${i}`,
        second_name: `Last${i}`,
        person_photo_url: null,
      }));
      storeMock.persons = vi.fn(() => largePersonList);
      fixture = TestBed.createComponent(PersonListComponent);
      component = fixture.componentInstance;

      component.changePage(2);
      expect(component.currentPage()).toBe(2);
    });

    it('should not change page when out of bounds', () => {
      component.changePage(0);
      expect(component.currentPage()).toBe(1);

      component.changePage(100);
      expect(component.currentPage()).toBe(1);
    });

    it('should change items per page and reset to page 1', () => {
      const largePersonList = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        first_name: `First${i}`,
        second_name: `Last${i}`,
        person_photo_url: null,
      }));
      storeMock.persons = vi.fn(() => largePersonList);
      fixture = TestBed.createComponent(PersonListComponent);
      component = fixture.componentInstance;

      component.changePage(2);
      component.changeItemsPerPage(20);

      expect(component.itemsPerPage()).toBe(20);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('Sorting', () => {
    it('should sort by second name in ascending order by default', () => {
      const sorted = component.sortedPersons();
      expect(sorted[0].second_name).toBe('Doe');
      expect(sorted[1].second_name).toBe('Johnson');
      expect(sorted[2].second_name).toBe('Smith');
    });

    it('should sort by second name in descending order', () => {
      component.sortOrder.set('desc');
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

    it('should toggle sort order when clicking same field', () => {
      component.toggleSort('second_name');
      expect(component.sortOrder()).toBe('desc');

      component.toggleSort('second_name');
      expect(component.sortOrder()).toBe('asc');
    });

    it('should reset sort order to asc when changing field', () => {
      component.sortOrder.set('desc');
      component.toggleSort('first_name');
      expect(component.sortBy()).toBe('first_name');
      expect(component.sortOrder()).toBe('asc');
    });

    it('should reset to page 1 when sorting changes', () => {
      component.currentPage.set(2);
      component.toggleSort('second_name');
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('Sort Icons', () => {
    it('should return double arrow for unsorted field', () => {
      expect(component.getSortIcon('first_name')).toBe('↕');
    });

    it('should return up arrow for ascending sort', () => {
      expect(component.getSortIcon('second_name')).toBe('↑');
    });

    it('should return down arrow for descending sort', () => {
      component.sortOrder.set('desc');
      expect(component.getSortIcon('second_name')).toBe('↓');
    });
  });
});
