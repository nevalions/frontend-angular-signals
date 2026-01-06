import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationHelperService } from './navigation-helper.service';

describe('NavigationHelperService', () => {
  let service: NavigationHelperService;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(NavigationHelperService);
  });

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to tournaments list', () => {
    service.toTournamentsList(1, 2024);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments']);
  });

  it('should navigate to tournament detail', () => {
    service.toTournamentDetail(1, 2024, 5);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments', 5]);
  });

  it('should navigate to tournament edit', () => {
    service.toTournamentEdit(1, 2024, 5);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments', 5, 'edit']);
  });

  it('should navigate to tournament create', () => {
    service.toTournamentCreate(1, 2024);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'seasons', 2024, 'tournaments', 'new']);
  });

  it('should navigate to sport detail', () => {
    service.toSportDetail(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);
  });

  it('should navigate to persons list', () => {
    service.toPersonsList();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons']);
  });

  it('should navigate to person detail', () => {
    service.toPersonDetail(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons', 1]);
  });

  it('should navigate to person edit', () => {
    service.toPersonEdit(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons', 1, 'edit']);
  });

  it('should navigate to person create', () => {
    service.toPersonCreate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/persons', 'new']);
  });
});
