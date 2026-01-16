import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { NavbarComponent } from './navbar.component';
import { SeasonStoreService } from '../../../features/seasons/services/season-store.service';
import { SportStoreService } from '../../../features/sports/services/sport-store.service';
import { ThemeService } from '../../services/theme.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let seasonStoreMock: { seasons: () => typeof mockSeasons };
  let sportStoreMock: { sports: () => typeof mockSports };
  let themeServiceMock: { currentTheme: () => 'light' | 'dark' };

  const mockSeasons = [
    { id: 1, year: 2023, description: null },
    { id: 2, year: 2024, description: null },
    { id: 3, year: 2025, description: null },
  ];

  const mockSports = [
    { id: 1, title: 'Football', description: null },
    { id: 2, title: 'Basketball', description: null },
  ];

  beforeEach(() => {
    seasonStoreMock = {
      seasons: signal(mockSeasons),
    };

    sportStoreMock = {
      sports: signal(mockSports),
    };

    themeServiceMock = {
      currentTheme: signal<'light' | 'dark'>('light'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SeasonStoreService, useValue: seasonStoreMock },
        { provide: SportStoreService, useValue: sportStoreMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display statsboard title', () => {
    expect(component.title).toBe('statsboard');
  });

  it('should expose sports signal', () => {
    const sports = component.sports();
    expect(sports).toEqual(mockSports);
  });

  it('should expose seasons signal', () => {
    const seasons = component.seasons();
    expect(seasons).toEqual(mockSeasons);
  });

  it('should toggle dropdown open/close', () => {
    expect(component.isDropdownOpen(1)).toBe(false);
    component.toggleDropdown(1);
    expect(component.isDropdownOpen(1)).toBe(true);
    component.toggleDropdown(1);
    expect(component.isDropdownOpen(1)).toBe(false);
  });

  it('should close all dropdowns', () => {
    component.toggleDropdown(1);
    component.toggleDropdown(2);
    expect(component.isDropdownOpen(1)).toBe(true);
    expect(component.isDropdownOpen(2)).toBe(true);
    component.closeAllDropdowns();
    expect(component.isDropdownOpen(1)).toBe(false);
    expect(component.isDropdownOpen(2)).toBe(false);
  });

  it('should handle multiple dropdowns independently', () => {
    component.toggleDropdown(1);
    component.toggleDropdown(2);
    expect(component.isDropdownOpen(1)).toBe(true);
    expect(component.isDropdownOpen(2)).toBe(true);
    component.toggleDropdown(1);
    expect(component.isDropdownOpen(1)).toBe(false);
    expect(component.isDropdownOpen(2)).toBe(true);
  });
});
