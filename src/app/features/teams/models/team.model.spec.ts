import { describe, expect, it } from 'vitest';

import { Team, TeamCreate, TeamUpdate, TeamsPaginatedResponse } from './team.model';

describe('Team model', () => {
  it('should accept valid Team object', () => {
    const team: Team = {
      id: 1,
      title: 'Manchester United',
      city: 'Manchester',
      team_logo_url: 'https://example.com/logo.png',
      team_color: '#DA291C',
      sport_id: 1,
    };
    expect(team.id).toBe(1);
    expect(team.title).toBe('Manchester United');
    expect(team.city).toBe('Manchester');
  });

  it('should accept Team without optional fields', () => {
    const team: Team = {
      id: 1,
      title: 'Team Name',
      team_color: '#c01c28',
      sport_id: 1,
    };
    expect(team.city).toBeUndefined();
    expect(team.description).toBeUndefined();
    expect(team.team_logo_url).toBeUndefined();
  });

  it('should handle team_logo_url as string', () => {
    const team: Team = {
      id: 1,
      title: 'Test Team',
      team_logo_url: 'https://example.com/logo.png',
      team_color: '#c01c28',
      sport_id: 1,
    };
    expect(typeof team.team_logo_url).toBe('string');
  });
});

describe('TeamCreate interface', () => {
  it('should accept valid TeamCreate object', () => {
    const teamData: TeamCreate = {
      title: 'New Team',
      city: 'New York',
      sport_id: 1,
    };
    expect(teamData.title).toBe('New Team');
    expect(teamData.city).toBe('New York');
    expect(teamData.sport_id).toBe(1);
  });

  it('should accept TeamCreate with team_color', () => {
    const teamData: TeamCreate = {
      title: 'Team',
      team_color: '#FF0000',
      sport_id: 1,
    };
    expect(teamData.team_color).toBe('#FF0000');
  });
});

describe('TeamUpdate interface', () => {
  it('should accept TeamUpdate object', () => {
    const teamUpdate: TeamUpdate = {
      title: 'Updated Team',
      city: 'Updated City',
    };
    expect(teamUpdate.title).toBe('Updated Team');
    expect(teamUpdate.city).toBe('Updated City');
  });
});

describe('TeamsPaginatedResponse interface', () => {
  it('should accept valid TeamsPaginatedResponse object', () => {
    const response: TeamsPaginatedResponse = {
      data: [
        { id: 1, title: 'Team 1', team_color: '#c01c28', sport_id: 1 },
        { id: 2, title: 'Team 2', team_color: '#DA291C', sport_id: 1 },
      ],
      metadata: {
        total_items: 2,
        page: 1,
        items_per_page: 10,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    };
    expect(response.data.length).toBe(2);
    expect(response.metadata.total_items).toBe(2);
    expect(response.metadata.page).toBe(1);
    expect(response.metadata.items_per_page).toBe(10);
    expect(response.metadata.total_pages).toBe(1);
    expect(response.metadata.has_next).toBe(false);
    expect(response.metadata.has_previous).toBe(false);
  });
});
