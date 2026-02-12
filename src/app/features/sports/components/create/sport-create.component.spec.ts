import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { FormBuilder } from '@angular/forms';
import { SportCreateComponent } from './sport-create.component';
import { SportStoreService } from '../../services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { SportScoreboardPresetStoreService } from '../../../sport-scoreboard-presets/services/sport-scoreboard-preset-store.service';

describe('SportCreateComponent', () => {
  let component: SportCreateComponent;
  let fixture: ComponentFixture<SportCreateComponent>;
  let navHelperMock: { toSportsList: ReturnType<typeof vi.fn> };
  let storeMock: { createSport: ReturnType<typeof vi.fn> };
  let presetStoreMock: { presets: ReturnType<typeof vi.fn> };
  let alertsMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navHelperMock = {
      toSportsList: vi.fn(),
    };

    storeMock = {
      createSport: vi.fn().mockReturnValue(of(undefined)),
    };

    presetStoreMock = {
      presets: vi.fn(() => []),
    };

    alertsMock = {
      open: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: NavigationHelperService, useValue: navHelperMock },
        { provide: SportStoreService, useValue: storeMock },
        { provide: SportScoreboardPresetStoreService, useValue: presetStoreMock },
        { provide: TuiAlertService, useValue: alertsMock },
        FormBuilder,
      ],
    });

    fixture = TestBed.createComponent(SportCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createSport on valid submit', () => {
    component.sportForm.setValue({
      title: 'Rugby',
      description: 'Rugby union',
      scoreboard_preset_id: null,
    });

    component.onSubmit();

    expect(storeMock.createSport).toHaveBeenCalledWith({
      title: 'Rugby',
      description: 'Rugby union',
    });
  });

  it('should not call createSport on invalid submit', () => {
    component.sportForm.setValue({
      title: '',
      description: '',
      scoreboard_preset_id: null,
    });

    component.onSubmit();

    expect(storeMock.createSport).not.toHaveBeenCalled();
  });

  it('should navigate to sports list on cancel', () => {
    component.cancel();

    expect(navHelperMock.toSportsList).toHaveBeenCalled();
  });
});
