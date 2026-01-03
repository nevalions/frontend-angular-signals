import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TournamentStoreService } from './tournament-store.service';
import { Tournament, TournamentCreate, TournamentUpdate } from '../models/tournament.model';
import { TuiAlertService } from '@taiga-ui/core';
import { ErrorHandlingService } from '../../../core/services/error.service';
import { buildApiUrl } from '../../../core/config/api.constants';

describe('TournamentStoreService', () => {
  let service: TournamentStoreService;
  let httpMock: HttpTestingController;
  let alertServiceMock: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TournamentStoreService,
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

    service = TestBed.inject(TournamentStoreService);
    httpMock = TestBed.inject(HttpTestingController);
    alertServiceMock = TestBed.inject(TuiAlertService);
  });

  describe('CRUD operations', () => {
    it('should call createTournament with correct data', () => {
      const tournamentData: TournamentCreate = {
        title: 'Tournament 2024',
        season_id: 1,
        sport_id: 1,
      };

      service.createTournament(tournamentData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/'));
      req.flush({ id: 1, title: 'Tournament 2024', season_id: 1, sport_id: 1 } as Tournament);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(tournamentData);
      expect(alertServiceMock.open).toHaveBeenCalledWith('Tournament created successfully', { label: 'Success' });
    });

    it('should handle createTournament error', () => {
      const tournamentData: TournamentCreate = {
        title: 'Tournament 2024',
        season_id: 1,
        sport_id: 1,
      };

      service.createTournament(tournamentData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/'));
      req.flush('Error', { status: 400, statusText: 'Bad Request' });

      expect(req.request.method).toBe('POST');
      expect(alertServiceMock.open).not.toHaveBeenCalledWith('Tournament created successfully', { label: 'Success' });
    });

    it('should call updateTournament with correct data', () => {
      const tournamentData: TournamentUpdate = {
        title: 'Updated Tournament',
      };

      service.updateTournament(2, tournamentData).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/2'));
      req.flush({ id: 2, title: 'Updated Tournament', season_id: 1, sport_id: 1 } as Tournament);

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(tournamentData);
      expect(alertServiceMock.open).toHaveBeenCalledWith('Tournament updated successfully', { label: 'Success' });
    });

    it('should handle updateTournament error', () => {
      const tournamentData: TournamentUpdate = {
        title: 'Updated Tournament',
      };

      service.updateTournament(2, tournamentData).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/2'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('PUT');
      expect(alertServiceMock.open).not.toHaveBeenCalledWith('Tournament updated successfully', { label: 'Success' });
    });

    it('should call deleteTournament with correct URL', () => {
      service.deleteTournament(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/1'));
      req.flush(null);

      expect(req.request.method).toBe('DELETE');
      expect(alertServiceMock.open).toHaveBeenCalledWith('Tournament deleted successfully', { label: 'Success' });
    });

    it('should handle deleteTournament error', () => {
      service.deleteTournament(1).subscribe({
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(buildApiUrl('/api/tournaments/1'));
      req.flush('Error', { status: 404, statusText: 'Not Found' });

      expect(req.request.method).toBe('DELETE');
      expect(alertServiceMock.open).not.toHaveBeenCalledWith('Tournament deleted successfully', { label: 'Success' });
    });

    it('should call getTournamentsBySeasonAndSport with correct URL', () => {
      service.getTournamentsBySeasonAndSport(2024, 1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/seasons/year/2024/sports/id/1/tournaments'));
      req.flush([]);

      expect(req.request.method).toBe('GET');
    });
  });

  describe('Signal properties', () => {
    it('should have tournaments signal', () => {
      expect(service.tournaments).toBeDefined();
      expect(typeof service.tournaments === 'function').toBe(true);
    });

    it('should have loading signal', () => {
      expect(service.loading).toBeDefined();
      expect(typeof service.loading === 'function').toBe(true);
    });

    it('should have error signal', () => {
      expect(service.error).toBeDefined();
      expect(typeof service.error === 'function').toBe(true);
    });

    it('should have tournamentsBySeason computed signal', () => {
      expect(service.tournamentsBySeason).toBeDefined();
      expect(typeof service.tournamentsBySeason === 'function').toBe(true);
    });

    it('should have tournamentsBySport computed signal', () => {
      expect(service.tournamentsBySport).toBeDefined();
      expect(typeof service.tournamentsBySport === 'function').toBe(true);
    });

    it('should have tournamentsBySportAndSeason computed signal', () => {
      expect(service.tournamentsBySportAndSeason).toBeDefined();
      expect(typeof service.tournamentsBySportAndSeason === 'function').toBe(true);
    });

    it('should have tournamentsResource', () => {
      expect(service.tournamentsResource).toBeDefined();
    });
  });

  describe('reload', () => {
    it('should have reload method', () => {
      expect(service.reload).toBeDefined();
      expect(typeof service.reload).toBe('function');
    });

    it('should trigger reload of tournamentsResource', () => {
      const reloadSpy = vi.spyOn(service.tournamentsResource, 'reload');

      service.reload();

      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
