import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamStoreService } from './team-store.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Team, TeamCreate, TeamUpdate } from '../models/team.model';

describe('TeamStoreService', () => {
  let service: TeamStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TeamStoreService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TeamStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should have teams signal', () => {
    expect(service.teams).toBeDefined();
    expect(typeof service.teams === 'function').toBe(true);
  });

  it('should have teamsResource', () => {
    expect(service.teamsResource).toBeDefined();
  });

  it('should have loading signal', () => {
    expect(service.loading).toBeDefined();
    expect(typeof service.loading === 'function').toBe(true);
  });

  it('should have error signal', () => {
    expect(service.error).toBeDefined();
    expect(typeof service.error === 'function').toBe(true);
  });

  it('should have reload method', () => {
    expect(service.reload).toBeDefined();
    expect(typeof service.reload).toBe('function');
  });

  it('should call createTeam with correct data', () => {
    const teamData: TeamCreate = {
      title: 'New Team',
      city: 'New York',
      sport_id: 1,
    };
    const mockResponse: Team = {
      id: 1,
      ...teamData,
      team_color: '#c01c28',
    };

    service.createTeam(teamData).subscribe();

    const req = httpMock.expectOne(buildApiUrl('/api/teams/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(teamData);
    req.flush(mockResponse);
  });

    it('should call updateTeam with correct data', () => {
      const teamUpdate: TeamUpdate = { title: 'Updated Team' };
      const mockResponse: Team = {
        id: 1,
        title: 'Updated Team',
        team_color: '#c01c28',
        sport_id: 1,
      };

      service.updateTeam(1, teamUpdate).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/teams/1/'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(teamUpdate);
      req.flush(mockResponse);
    });

    it('should call deleteTeam with correct id', () => {
      service.deleteTeam(1).subscribe();

      const req = httpMock.expectOne(buildApiUrl('/api/teams/id/1'));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

  it('should get teams by sport id with pagination', () => {
    const mockResponse = {
      data: [
        { id: 1, title: 'Team 1', team_color: '#c01c28', sport_id: 1 },
      ],
      metadata: {
        total_items: 1,
        page: 1,
        items_per_page: 10,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    };

    service.getTeamsBySportIdPaginated(1, 1, 10).subscribe();

    const req = httpMock.expectOne(buildApiUrl('/api/sports/id/1/teams/paginated?page=1&items_per_page=10'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should trigger reload of teamsResource', () => {
    const reloadSpy = vi.spyOn(service.teamsResource, 'reload');

    service.reload();

    expect(reloadSpy).toHaveBeenCalled();
  });
});
