import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TeamEditComponent } from './team-edit.component';
import { TeamStoreService } from '../../services/team-store.service';
import { Team } from '../../models/team.model';

describe('TeamEditComponent', () => {
  let component: TeamEditComponent;
  let fixture: ComponentFixture<TeamEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let routeMock: {
    snapshot: { paramMap: { get: (_key: string) => string | null }; queryParamMap: { get: (_key: string) => string | null } };
  };
  let storeMock: { teams: ReturnType<typeof vi.fn>; updateTeam: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      snapshot: {
        paramMap: { get: (key: string) => (key === 'sportId' ? '1' : key === 'teamId' ? '1' : null) },
        queryParamMap: { get: (key: string) => (key === 'year' ? '2024' : null) },
      },
    };

    storeMock = {
      teams: vi.fn().mockReturnValue([
        { id: 1, title: 'Test Team', team_color: '#FF0000', sport_id: 1 } as Team,
      ]),
      updateTeam: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TeamStoreService, useValue: storeMock },
      ],
      imports: [ReactiveFormsModule],
    });

    fixture = TestBed.createComponent(TeamEditComponent);
    component = fixture.componentInstance;
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract teamId from route params', () => {
    expect(component.teamId()).toBe(1);
  });

  it('should extract sportId from route params', () => {
    expect(component.sportId()).toBe(1);
  });

  it('should find team by id from store', () => {
    const team = component.team();
    expect(team).toEqual({ id: 1, title: 'Test Team', team_color: '#FF0000', sport_id: 1 });
  });

  it('should navigate to detail on cancel', () => {
    component.navigateToDetail();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1, 'teams', 1], { queryParams: { year: 2024 } });
  });

  it('should call updateTeam on valid form submit', () => {
    component.teamForm.setValue({
      title: 'Updated Team',
      city: 'New City',
      description: 'Updated description',
      team_color: '#00FF00',
      team_eesl_id: '123',
      team_logo_url: 'http://example.com/logo.png',
      team_logo_icon_url: 'http://example.com/icon.png',
      team_logo_web_url: 'http://example.com/web.png',
      sponsor_line_id: '456',
      main_sponsor_id: '789',
    });

    component.onSubmit();

    expect(storeMock.updateTeam).toHaveBeenCalledWith(1, {
      title: 'Updated Team',
      city: 'New City',
      description: 'Updated description',
      team_color: '#00FF00',
      team_eesl_id: 123,
      team_logo_url: 'http://example.com/logo.png',
      team_logo_icon_url: 'http://example.com/icon.png',
      team_logo_web_url: 'http://example.com/web.png',
      sponsor_line_id: 456,
      main_sponsor_id: 789,
    });
  });

  it('should not call updateTeam on invalid form submit', () => {
    component.teamForm.setValue({
      title: '',
      city: 'City',
      team_color: '#00FF00',
      team_eesl_id: '',
      team_logo_url: '',
      team_logo_icon_url: '',
      team_logo_web_url: '',
      sponsor_line_id: '',
      main_sponsor_id: '',
    });

    component.onSubmit();

    expect(storeMock.updateTeam).not.toHaveBeenCalled();
  });

  it('should pre-populate form from team (via effect)', () => {
    fixture.detectChanges();

    expect(component.teamForm.value.title).toBe('Test Team');
    expect(component.teamForm.value.team_color).toBe('#FF0000');
  });

  it('should handle title validation - required', () => {
    component.teamForm.get('title')?.setValue('');
    expect(component.teamForm.get('title')?.valid).toBe(false);
    expect(component.teamForm.get('title')?.errors?.['required']).toBeDefined();
  });

  it('should handle team_color validation - required', () => {
    component.teamForm.get('team_color')?.setValue('');
    expect(component.teamForm.get('team_color')?.valid).toBe(false);
    expect(component.teamForm.get('team_color')?.errors?.['required']).toBeDefined();
  });

  it('should accept valid form data', () => {
    component.teamForm.setValue({
      title: 'Valid Team',
      city: 'Valid City',
      description: 'Valid Description',
      team_color: '#FFFFFF',
      team_eesl_id: '',
      team_logo_url: '',
      team_logo_icon_url: '',
      team_logo_web_url: '',
      sponsor_line_id: '',
      main_sponsor_id: '',
    });

    expect(component.teamForm.valid).toBe(true);
  });

  it('should allow optional fields', () => {
    component.teamForm.setValue({
      title: 'Team Name',
      city: '',
      description: '',
      team_color: '#FF0000',
      team_eesl_id: '',
      team_logo_url: '',
      team_logo_icon_url: '',
      team_logo_web_url: '',
      sponsor_line_id: '',
      main_sponsor_id: '',
    });

    expect(component.teamForm.valid).toBe(true);
  });
});
