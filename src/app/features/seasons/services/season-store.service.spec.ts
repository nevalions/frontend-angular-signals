import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SeasonStoreService } from './season-store.service';
import { Season, SeasonCreate, SeasonUpdate } from '../models/season.model';
import { TuiAlertService } from '@taiga-ui/core';

describe('SeasonStoreService', () => {
  let service: SeasonStoreService;
  let httpMock: HttpTestingController;
  let alertServiceMock: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(),
        SeasonStoreService,
        {
          provide: TuiAlertService,
          useValue: {
            open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
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

      const req = httpMock.expectOne('/api/seasons/');
      req.flush({ id: 1, year: 2024, description: 'Test season' } as Season);

      service.createSeason(seasonData).subscribe();

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(seasonData);
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season created successfully', { label: 'Success' });
    });

    it('should call updateSeason with correct data', () => {
      const seasonData: SeasonUpdate = {
        year: 2025,
        description: 'Updated description',
      };

      const req = httpMock.expectOne((request) =>
        request.url === '/api/seasons/' && request.params.get('item_id') === '2'
      );
      req.flush({ id: 2, year: 2025, description: 'Updated description' } as Season);

      service.updateSeason(2, seasonData).subscribe();

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(seasonData);
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season updated successfully', { label: 'Success' });
    });

    it('should call deleteSeason with correct URL', () => {
      const req = httpMock.expectOne('/api/seasons/id/1');
      req.flush(null);

      service.deleteSeason(1).subscribe();

      expect(req.request.method).toBe('DELETE');
      expect(alertServiceMock.open).toHaveBeenCalledWith('Season deleted successfully', { label: 'Success' });
    });

    it('should call getTournamentsByYear with correct URL', () => {
      const req = httpMock.expectOne('/api/seasons/year/2024/tournaments');
      req.flush([]);

      service.getTournamentsByYear(2024).subscribe();

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
