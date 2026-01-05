import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SeasonListComponent } from './season-list.component';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season } from '../../models/season.model';

interface SeasonStoreMock {
  seasons: ReturnType<typeof vi.fn>;
  loading: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
}

describe('SeasonListComponent', () => {
  let component: SeasonListComponent;
  let fixture: ComponentFixture<SeasonListComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let storeMock: SeasonStoreMock;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    const mockSeasons: Season[] = [
      { id: 1, year: 2024, description: 'Season 2024' },
      { id: 2, year: 2025, description: 'Season 2025' },
    ];

    storeMock = {
      seasons: vi.fn(() => mockSeasons),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SeasonStoreService, useValue: storeMock },
      ],
    });

    fixture = TestBed.createComponent(SeasonListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to create on button click', () => {
    component.navigateToCreate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons/create']);
  });

  it('should navigate to detail on card click', () => {
    component.navigateToDetail(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 1]);
  });

  it('should expose seasons from store', () => {
    const seasons = component.seasons();

    expect(seasons).toEqual([
      { id: 1, year: 2024, description: 'Season 2024' },
      { id: 2, year: 2025, description: 'Season 2025' },
    ]);
  });

  it('should expose loading state from store', () => {
    const loading = component.loading();

    expect(loading).toBe(false);
  });

  it('should expose error state from store', () => {
    const error = component.error();

    expect(error).toBe(null);
  });

  it('should handle loading state correctly', () => {
    storeMock.loading = vi.fn(() => true);
    const newComponent = TestBed.createComponent(SeasonListComponent).componentInstance;

    expect(newComponent.loading()).toBe(true);
  });

  it('should handle error state correctly', () => {
    const mockError = new Error('API Error');
    storeMock.error = vi.fn(() => mockError);
    const newComponent = TestBed.createComponent(SeasonListComponent).componentInstance;

    expect(newComponent.error()).toBe(mockError);
  });

  it('should handle empty seasons list', () => {
    storeMock.seasons = vi.fn(() => []);
    const newComponent = TestBed.createComponent(SeasonListComponent).componentInstance;

    expect(newComponent.seasons()).toEqual([]);
  });

  it('should call navigate with correct season id', () => {
    component.navigateToDetail(5);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons', 5]);
  });
});
