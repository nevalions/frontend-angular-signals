import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SeasonStoreService } from './season-store.service';
import { Season, SeasonCreate, SeasonUpdate } from '../models/season.model';
import { TuiAlertService } from '@taiga-ui/core';
import { ErrorHandlingService } from '../../../core/services/error.service';
import { buildApiUrl } from '../../../core/config/api.constants';

describe('SeasonStoreService', () => {
  let service: SeasonStoreService;
  let httpMock: HttpTestingController;
  let alertServiceMock: Partial<TuiAlertService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        SeasonStoreService,
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

    service = TestBed.inject(SeasonStoreService);
    httpMock = TestBed.inject(HttpTestingController);
    alertServiceMock = TestBed.inject(TuiAlertService);
  });

  describe('CRUD operations', () => {
    it('should call createSeason with correct data', () => {
      const seasonData: SeasonCreate = {
        year: 2024,
        description: 'Test season',
      };

      service.createSeason(seasonData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/'));
      req.flush({ id: 1, year: 2024, description: 'Test season' } as Season);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(seasonData);
    });

    it('should handle createSeason error', () => {
      const seasonData: SeasonCreate = {
        year: 2024,
        description: 'Test season',
      };

      service.createSeason(seasonData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/'));
      req.flush('Error', { status: 400, statusText: 'Bad Request' });

      expect(req.request.method).toBe('POST');
    });

    it('should call updateSeason with correct data', () => {
      const seasonData: SeasonUpdate = {
        year: 2025,
        description: 'Updated description',
      };

      service.updateSeason(2, seasonData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/2/'));
      req.flush({ id: 2, year: 2025, description: 'Updated description' } as Season);

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(seasonData);
    });

    it('should handle updateSeason error', () => {
      const seasonData: SeasonUpdate = {
        year: 2025,
        description: 'Updated description',
      };

      service.updateSeason(2, seasonData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/2/'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('PUT');
    });

    it('should call deleteSeason with correct URL', () => {
      service.deleteSeason(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/id/1'));
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
    });

    it('should handle deleteSeason error', () => {
      service.deleteSeason(1).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/id/1'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('DELETE');
    });

    it('should call getTournamentsByYear with correct URL', () => {
      service.getTournamentsByYear(2024).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/year/2024/tournaments'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });

    it('should call getTeamsByYear with correct URL', () => {
      service.getTeamsByYear(2024).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/year/2024/teams'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });

    it('should call getMatchesByYear with correct URL', () => {
      service.getMatchesByYear(2024).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/year/2024/matches'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });
  });

  describe('Signal properties', () => {
    it('should have seasons signal', () => {
      expect(service.seasons).toBeDefined();
      expect(typeof service.seasons === 'function').toBe(true);
    });

    it('should have loading signal', () => {
      expect(service.loading).toBeDefined();
      expect(typeof service.loading === 'function').toBe(true);
    });

    it('should have error signal', () => {
      expect(service.error).toBeDefined();
      expect(typeof service.error === 'function').toBe(true);
    });

    it('should have seasonByYear computed signal', () => {
      expect(service.seasonByYear).toBeDefined();
      expect(typeof service.seasonByYear === 'function').toBe(true);
    });

    it('should have seasonsResource', () => {
      expect(service.seasonsResource).toBeDefined();
    });
  });

  describe('reload', () => {
    it('should have reload method', () => {
      expect(service.reload).toBeDefined();
      expect(typeof service.reload).toBe('function');
    });

    it('should trigger reload of seasonsResource', () => {
      const reloadSpy = vi.spyOn(service.seasonsResource, 'reload');

      service.reload();

      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
