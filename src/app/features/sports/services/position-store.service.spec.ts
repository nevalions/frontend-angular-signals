import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PositionStoreService } from './position-store.service';
import { Position, PositionCreate, PositionUpdate } from '../models/position.model';
import { ErrorHandlingService } from '../../../core/services/error.service';
import { buildApiUrl } from '../../../core/config/api.constants';

describe('PositionStoreService', () => {
  let service: PositionStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        PositionStoreService,
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

    service = TestBed.inject(PositionStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    const pending = httpMock.match(() => true);
    pending.forEach((req) => req.flush([]));
    httpMock.verify();
  });

  describe('CRUD operations', () => {
    it('should call getPositionsBySportId with correct URL', () => {
      service.getPositionsBySportId(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/sports/id/1/positions'));
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should call createPosition with correct data', () => {
      const positionData: PositionCreate = {
        title: 'Midfielder',
        sport_id: 1,
      };

      service.createPosition(positionData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/positions/'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(positionData);
      req.flush({ id: 3, ...positionData } as Position);
    });

    it('should call updatePosition with correct data', () => {
      const positionData: PositionUpdate = {
        title: 'Winger',
      };

      service.updatePosition(1, positionData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/positions/1/'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(positionData);
      req.flush({ id: 1, title: 'Winger', sport_id: 1 } as Position);
    });

    it('should call deletePosition with correct URL', () => {
      service.deletePosition(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/positions/id/1'));
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
    });
  });
});
