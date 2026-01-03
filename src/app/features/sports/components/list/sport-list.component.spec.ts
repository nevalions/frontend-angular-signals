import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SportListComponent } from './sport-list.component';
import { SportStoreService } from '../../services/sport-store.service';
import { Sport } from '../../models/sport.model';

describe('SportListComponent', () => {
  let component: SportListComponent;
  let fixture: ComponentFixture<SportListComponent>;
  let routerMock: any;
  let storeMock: any;

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    const mockSports: Sport[] = [
      { id: 1, title: 'Football', description: 'Soccer sport' },
      { id: 2, title: 'Basketball', description: 'Basketball sport' },
    ];

    storeMock = {
      sports: vi.fn(() => mockSports),
      loading: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: SportStoreService, useValue: storeMock },
      ],
    });

    fixture = TestBed.createComponent(SportListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to detail on card click', () => {
    component.navigateToDetail(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);
  });

  it('should expose sports from store', () => {
    const sports = component.sports();

    expect(sports).toEqual([
      { id: 1, title: 'Football', description: 'Soccer sport' },
      { id: 2, title: 'Basketball', description: 'Basketball sport' },
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
    const newComponent = TestBed.createComponent(SportListComponent).componentInstance;

    expect(newComponent.loading()).toBe(true);
  });

  it('should handle error state correctly', () => {
    const mockError = new Error('API Error');
    storeMock.error = vi.fn(() => mockError);
    const newComponent = TestBed.createComponent(SportListComponent).componentInstance;

    expect(newComponent.error()).toBe(mockError);
  });

  it('should handle empty sports list', () => {
    storeMock.sports = vi.fn(() => []);
    const newComponent = TestBed.createComponent(SportListComponent).componentInstance;

    expect(newComponent.sports()).toEqual([]);
  });

  it('should call navigate with correct sport id', () => {
    component.navigateToDetail(5);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 5]);
  });
});
