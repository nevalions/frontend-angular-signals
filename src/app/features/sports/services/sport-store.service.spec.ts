import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SportStoreService } from './sport-store.service';
import { Sport, SportCreate, SportUpdate } from '../models/sport.model';
import { TuiAlertService } from '@taiga-ui/core';
import { ErrorHandlingService } from '../../../core/services/error.service';
import { buildApiUrl } from '../../../core/config/api.constants';

describe('SportStoreService', () => {
  let service: SportStoreService;
  let httpMock: HttpTestingController;
  let alertServiceMock: Partial<TuiAlertService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        SportStoreService,
        {
          provide: TuiAlertService,
          useValue: {
            open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
          },
        },
        {
          provide: ErrorHandlingService,
          useValue: {
            handleError: vi.fn((error) => {
              throw error;
            }),
          },
        },
      ],
    });

    service = TestBed.inject(SportStoreService);
    httpMock = TestBed.inject(HttpTestingController);
    alertServiceMock = TestBed.inject(TuiAlertService);
  });

  describe('CRUD operations', () => {
    it('should call createSport with correct data', () => {
      const sportData: SportCreate = {
        title: 'Football',
        description: 'Soccer sport',
      };

      service.createSport(sportData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
      req.flush({ id: 1, title: 'Football', description: 'Soccer sport' } as Sport);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sportData);
    });

    it('should handle createSport error', () => {
      const sportData: SportCreate = {
        title: 'Football',
        description: 'Soccer sport',
      };

      service.createSport(sportData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
      req.flush('Error', { status: 400, statusText: 'Bad Request' });

      expect(req.request.method).toBe('POST');
    });

    it('should call updateSport with correct data', () => {
      const sportData: SportUpdate = {
        title: 'Basketball',
        description: 'Basketball sport',
      };

      service.updateSport(2, sportData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/sports/2/'));
      req.flush({ id: 2, title: 'Basketball', description: 'Basketball sport' } as Sport);

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(sportData);
    });

    it('should handle updateSport error', () => {
      const sportData: SportUpdate = {
        title: 'Basketball',
        description: 'Basketball sport',
      };

      service.updateSport(2, sportData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/sports/2/'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('PUT');
    });

    it('should call deleteSport with correct URL', () => {
      service.deleteSport(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/sports/id/1'));
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
    });

    it('should handle deleteSport error', () => {
      service.deleteSport(1).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/sports/id/1'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('DELETE');
    });

    it('should call getTournamentsBySport with correct URL', () => {
      service.getTournamentsBySport(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/sports/id/1/tournaments'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });
  });

  describe('Signal properties', () => {
    it('should have sports signal', () => {
      expect(service.sports).toBeDefined();
      expect(typeof service.sports === 'function').toBe(true);
    });

    it('should have loading signal', () => {
      expect(service.loading).toBeDefined();
      expect(typeof service.loading === 'function').toBe(true);
    });

    it('should have error signal', () => {
      expect(service.error).toBeDefined();
      expect(typeof service.error === 'function').toBe(true);
    });

    it('should have sportById computed signal', () => {
      expect(service.sportById).toBeDefined();
      expect(typeof service.sportById === 'function').toBe(true);
    });

    it('should have sportsResource', () => {
      expect(service.sportsResource).toBeDefined();
    });
  });

  describe('reload', () => {
    it('should have reload method', () => {
      expect(service.reload).toBeDefined();
      expect(typeof service.reload).toBe('function');
    });

    it('should trigger reload of sportsResource', () => {
      const reloadSpy = vi.spyOn(service.sportsResource, 'reload');

      service.reload();

      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
