import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SportScoreboardPresetCreateComponent } from './sport-scoreboard-preset-create.component';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { SportScoreboardPresetCreate } from '../../models/sport-scoreboard-preset.model';

describe('SportScoreboardPresetCreateComponent', () => {
  let component: SportScoreboardPresetCreateComponent;
  let fixture: ComponentFixture<SportScoreboardPresetCreateComponent>;
  let mockPresetStore: any;
  let mockNavigationHelper: any;
  let mockAlerts: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockPresetStore = {
      create: vi.fn().mockReturnValue(of({ id: 1 })),
    };

    mockNavigationHelper = {
      toSportScoreboardPresetList: vi.fn(),
    };

    mockAlerts = {
      open: vi.fn().mockReturnValue({
        pipe: () => ({ subscribe: vi.fn((cb) => cb(true)) }),
      }),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        SportScoreboardPresetCreateComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TuiButton,
        TuiCheckbox,
      ],
      providers: [
        { provide: SportScoreboardPresetStoreService, useValue: mockPresetStore },
        { provide: NavigationHelperService, useValue: mockNavigationHelper },
        { provide: TuiAlertService, useValue: mockAlerts },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportScoreboardPresetCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.presetForm.value.title).toBe('');
      expect(component.presetForm.value.gameclock_max).toBe(720);
      expect(component.presetForm.value.initial_time_mode).toBe('max');
      expect(component.presetForm.value.initial_time_min_seconds).toBeNull();
      expect(component.presetForm.value.period_clock_variant).toBe('per_period');
      expect(component.presetForm.value.direction).toBe('down');
      expect(component.presetForm.value.on_stop_behavior).toBe('hold');
      expect(component.presetForm.value.period_mode).toBe('qtr');
      expect(component.presetForm.value.period_count).toBe(4);
    });

    it('should have initial time mode options', () => {
      expect(component.initialTimeModeOptions).toHaveLength(3);
      const modeValues = component.initialTimeModeOptions.map((opt) => opt.value);
      expect(modeValues).toContain('max');
      expect(modeValues).toContain('zero');
      expect(modeValues).toContain('min');
    });
  });

  describe('Form Validation', () => {
    it('should require title', () => {
      component.presetForm.controls.title.setValue('');
      expect(component.presetForm.controls.title.valid).toBe(false);
    });

    it('should validate title is required', () => {
      component.presetForm.controls.title.setValue('');
      expect(component.presetForm.controls.title.errors?.['required']).toBe(true);
    });

    it('should accept valid title', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      expect(component.presetForm.controls.title.valid).toBe(true);
    });
  });

  describe('Initial Time Mode Validation', () => {
    it('should show custom min time field when initial_time_mode is min', () => {
      component.presetForm.controls.initial_time_mode.setValue('max');
      fixture.detectChanges();
      expect(component.isCustomMinTimeMode()).toBe(false);

      component.presetForm.controls.initial_time_mode.setValue('min');
      fixture.detectChanges();
      expect(component.isCustomMinTimeMode()).toBe(true);
    });

    it('should not show custom min time field when initial_time_mode is max', () => {
      component.presetForm.controls.initial_time_mode.setValue('max');
      fixture.detectChanges();
      expect(component.isCustomMinTimeMode()).toBe(false);
    });

    it('should not show custom min time field when initial_time_mode is zero', () => {
      component.presetForm.controls.initial_time_mode.setValue('zero');
      fixture.detectChanges();
      expect(component.isCustomMinTimeMode()).toBe(false);
    });

    it('should mark form invalid when initial_time_mode is min and initial_time_min_seconds is null', () => {
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(null);
      fixture.detectChanges();
      expect(component.customMinTimeModeInvalid()).toBe(true);
    });

    it('should mark form valid when initial_time_mode is min and initial_time_min_seconds is set', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(300);
      fixture.detectChanges();
      expect(component.customMinTimeModeInvalid()).toBe(false);
    });

    it('should mark form valid when initial_time_mode is min and initial_time_min_seconds is 0', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(0);
      fixture.detectChanges();
      expect(component.customMinTimeModeInvalid()).toBe(false);
    });

    it('should mark form invalid when initial_time_mode is min and initial_time_min_seconds is negative', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(-1);
      fixture.detectChanges();
      expect(component.customMinTimeModeInvalid()).toBe(true);
    });
  });

  describe('Period Mode Validation', () => {
    it('should show custom period labels when period_mode is custom', () => {
      component.presetForm.controls.period_mode.setValue('custom');
      fixture.detectChanges();
      expect(component.isCustomPeriodMode()).toBe(true);
    });

    it('should not show custom period labels when period_mode is qtr', () => {
      component.presetForm.controls.period_mode.setValue('qtr');
      fixture.detectChanges();
      expect(component.isCustomPeriodMode()).toBe(false);
    });

    it('should mark form invalid when custom period labels are invalid', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.period_mode.setValue('custom');
      component.presetForm.controls.period_labels_input.setValue('Q1, Q2, Q3');
      fixture.detectChanges();
      expect(component.customPeriodLabelsInvalid()).toBe(true);
    });

    it('should mark form valid when custom period labels are valid', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.period_mode.setValue('custom');
      component.presetForm.controls.period_labels_input.setValue('q1,q2,q3');
      fixture.detectChanges();
      expect(component.customPeriodLabelsInvalid()).toBe(false);
    });
  });

  describe('Payload Mapping', () => {
    it('should create payload with max initial time mode', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_input: '',
        default_playclock_seconds: null,
      });

      const expected: SportScoreboardPresetCreate = {
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_json: null,
        default_playclock_seconds: null,
      };

      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalledWith(expected);
    });

    it('should create payload with zero initial time mode', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'zero',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_input: '',
        default_playclock_seconds: null,
      });

      const expected: SportScoreboardPresetCreate = {
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'zero',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_json: null,
        default_playclock_seconds: null,
      };

      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalledWith(expected);
    });

    it('should create payload with min initial time mode', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'min',
        initial_time_min_seconds: 300,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_input: '',
        default_playclock_seconds: null,
      });

      const expected: SportScoreboardPresetCreate = {
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'min',
        initial_time_min_seconds: 300,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_json: null,
        default_playclock_seconds: null,
      };

      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalledWith(expected);
    });

    it('should create payload with non-720 gameclock_max', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 900,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_input: '',
        default_playclock_seconds: null,
      });

      const expected: SportScoreboardPresetCreate = {
        title: 'Test Preset',
        gameclock_max: 900,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_json: null,
        default_playclock_seconds: null,
      };

      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalledWith(expected);
    });

    it('should create payload with custom period labels', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'custom',
        period_count: 3,
        period_labels_input: 'leg_1, leg_2, leg_3',
        default_playclock_seconds: null,
      });

      const expected: SportScoreboardPresetCreate = {
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'custom',
        period_count: 3,
        period_labels_json: ['leg_1', 'leg_2', 'leg_3'],
        default_playclock_seconds: null,
      };

      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalledWith(expected);
    });
  });

  describe('Form Submission', () => {
    it('should not submit form when invalid', () => {
      component.presetForm.controls.title.setValue('');
      component.onSubmit();
      expect(mockPresetStore.create).not.toHaveBeenCalled();
    });

    it('should not submit form when custom min time is invalid', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(null);
      component.onSubmit();
      expect(mockPresetStore.create).not.toHaveBeenCalled();
    });

    it('should submit form when valid', () => {
      component.presetForm.setValue({
        title: 'Test Preset',
        gameclock_max: 720,
        initial_time_mode: 'max',
        initial_time_min_seconds: null,
        period_clock_variant: 'per_period',
        direction: 'down',
        on_stop_behavior: 'hold',
        is_qtr: true,
        is_time: true,
        is_playclock: true,
        is_downdistance: true,
        has_timeouts: true,
        has_playclock: true,
        period_mode: 'qtr',
        period_count: 4,
        period_labels_input: '',
        default_playclock_seconds: null,
      });
      component.onSubmit();
      expect(mockPresetStore.create).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to list on cancel', () => {
      component.navigateToList();
      expect(mockNavigationHelper.toSportScoreboardPresetList).toHaveBeenCalled();
    });
  });
});
