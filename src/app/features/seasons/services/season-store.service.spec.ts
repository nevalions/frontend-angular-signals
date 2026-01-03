import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let alertServiceMock: any;

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
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season created successfully', { label: 'Success' });
    });

    it('should call updateSeason with correct data', () => {
      const seasonData: SeasonUpdate = {
        year: 2025,
        description: 'Updated description',
      };

      service.updateSeason(2, seasonData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/') + '?item_id=2');
      req.flush({ id: 2, year: 2025, description: 'Updated description' } as Season);

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(seasonData);
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season updated successfully', { label: 'Success' });
    });

    it('should call deleteSeason with correct URL', () => {
      service.deleteSeason(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/id/1'));
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season deleted successfully', { label: 'Success' });
    });

    it('should call getTournamentsByYear with correct URL', () => {
      service.getTournamentsByYear(2024).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/year/2024/tournaments'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });
  });

  describe('Computed signals', () => {
    it('should have seasons signal', () => {
      expect(service.seasons).toBeDefined();
    });

    it('should have loading signal', () => {
      expect(service.loading).toBeDefined();
    });

    it('should have error signal', () => {
      expect(service.error).toBeDefined();
    });

    it('should have seasonByYear computed signal', () => {
      expect(service.seasonByYear).toBeDefined();
    });
  });

  describe('reload', () => {
    it('should have reload method', () => {
      expect(service.reload).toBeDefined();
      expect(typeof service.reload).toBe('function');
    });
  });
});
