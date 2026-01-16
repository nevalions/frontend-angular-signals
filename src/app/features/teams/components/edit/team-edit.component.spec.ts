import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { TeamEditComponent } from './team-edit.component';
import { TeamStoreService } from '../../services/team-store.service';
import { Team, LogoUploadResponse } from '../../models/team.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

describe('TeamEditComponent', () => {
  let component: TeamEditComponent;
  let fixture: ComponentFixture<TeamEditComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let navHelperMock: { toTeamDetail: ReturnType<typeof vi.fn> };
  let routeMock: {
    snapshot: { paramMap: { get: (_key: string) => string | null }; queryParamMap: { get: (_key: string) => string | null } };
  };
  let storeMock: { teams: ReturnType<typeof vi.fn>; updateTeam: ReturnType<typeof vi.fn>; uploadTeamLogo: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    navHelperMock = {
      toTeamDetail: vi.fn(),
    };

    routeMock = {
      snapshot: {
        paramMap: { get: (key: string) => (key === 'sportId' ? '1' : key === 'teamId' ? '1' : null) },
        queryParamMap: { get: (key: string) => (key === 'year' ? '2024' : null) },
      },
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    storeMock = {
      teams: vi.fn().mockReturnValue([
        { id: 1, title: 'Test Team', team_color: '#FF0000', sport_id: 1 } as Team,
      ]),
      updateTeam: vi.fn().mockReturnValue(of(undefined)),
      uploadTeamLogo: vi.fn().mockReturnValue(of({})),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: TeamStoreService, useValue: storeMock },
        { provide: TuiAlertService, useValue: alertsMock },
        { provide: NavigationHelperService, useValue: navHelperMock },
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
    expect(navHelperMock.toTeamDetail).toHaveBeenCalledWith(1, 1, 2024);
  });

  it('should call updateTeam on valid form submit', () => {
    component.teamForm.setValue({
      title: 'Updated Team',
      city: 'New City',
      description: 'Updated description',
      team_color: '#00FF00',
      team_eesl_id: '123',
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
      sponsor_line_id: 456,
      main_sponsor_id: 789,
    });
  });

  it('should not call updateTeam on invalid form submit', () => {
    component.teamForm.setValue({
      title: '',
      city: 'City',
      description: '',
      team_color: '#00FF00',
      team_eesl_id: '',
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
      sponsor_line_id: '',
      main_sponsor_id: '',
    });

    expect(component.teamForm.valid).toBe(true);
  });

  describe('Logo Upload', () => {
    it('should call uploadTeamLogo when file is selected', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockEvent = {
        target: { files: [mockFile] } as unknown as HTMLInputElement,
      } as unknown as Event;

      const uploadResponse: LogoUploadResponse = {
        original: '/uploads/logos/test.png',
        icon: '/uploads/icons/test-icon.png',
        webview: '/uploads/web/test-web.png',
      };

      vi.spyOn(storeMock, 'uploadTeamLogo').mockReturnValue(of(uploadResponse));

      component.onFileSelected(mockEvent);

      expect(storeMock.uploadTeamLogo).toHaveBeenCalledWith(mockFile);
      expect(component.logoPreviewUrls()).toEqual({
        original: 'http://localhost:9000/uploads/logos/test.png',
        icon: 'http://localhost:9000/uploads/icons/test-icon.png',
        webview: 'http://localhost:9000/uploads/web/test-web.png',
      });
      expect(component.logoUploadLoading()).toBe(false);
    });

    it('should show error for non-image files', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockEvent = {
        target: { files: [mockFile] } as unknown as HTMLInputElement,
      } as unknown as Event;

      component.onFileSelected(mockEvent);

      expect(storeMock.uploadTeamLogo).not.toHaveBeenCalled();
      expect(alertsMock.open).toHaveBeenCalledWith(
        'Please select an image file',
        { label: 'Error', appearance: 'negative' }
      );
    });

    it('should show error for files larger than 5MB', () => {
      const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      const mockEvent = {
        target: { files: [largeFile] } as unknown as HTMLInputElement,
      } as unknown as Event;

      component.onFileSelected(mockEvent);

      expect(storeMock.uploadTeamLogo).not.toHaveBeenCalled();
      expect(alertsMock.open).toHaveBeenCalledWith(
        'File size must be less than 5MB',
        { label: 'Error', appearance: 'negative' }
      );
    });

    it('should set logoUploadLoading to false on upload error', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockEvent = {
        target: { files: [mockFile] } as unknown as HTMLInputElement,
      } as unknown as Event;

      vi.spyOn(storeMock, 'uploadTeamLogo').mockReturnValue(throwError(() => new Error('Upload failed')));

      component.onFileSelected(mockEvent);

      expect(component.logoUploadLoading()).toBe(false);
    });
  });
});
