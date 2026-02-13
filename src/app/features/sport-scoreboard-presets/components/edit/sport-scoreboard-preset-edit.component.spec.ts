import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SportScoreboardPresetEditComponent } from './sport-scoreboard-preset-edit.component';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { TuiAlertService, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { SportScoreboardPresetUpdate, SportScoreboardPreset } from '../../models/sport-scoreboard-preset.model';

describe('SportScoreboardPresetEditComponent', () => {
  let component: SportScoreboardPresetEditComponent;
  let fixture: ComponentFixture<SportScoreboardPresetEditComponent>;
  let mockPresetStore: any;
  let mockNavigationHelper: any;
  let mockAlerts: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockPreset: SportScoreboardPreset = {
    id: 1,
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

  beforeEach(async () => {
    mockPresetStore = {
      presets: signal([mockPreset]),
      loading: signal(false),
      update: vi.fn().mockReturnValue(of({ id: 1 })),
    };

    mockNavigationHelper = {
      toSportScoreboardPresetDetail: vi.fn(),
    };

    mockAlerts = {
      open: vi.fn().mockReturnValue({
        pipe: () => ({ subscribe: vi.fn((cb) => cb(true)) }),
      }),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      paramMap: of({ get: () => '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [
        SportScoreboardPresetEditComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TuiButton,
        TuiLoader,
        TuiCheckbox,
      ],
      providers: [
        { provide: SportScoreboardPresetStoreService, useValue: mockPresetStore },
        { provide: NavigationHelperService, useValue: mockNavigationHelper },
        { provide: TuiAlertService, useValue: mockAlerts },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportScoreboardPresetEditComponent);
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

    it('should parse preset id from route params', () => {
      expect(component.presetId()).toBe(1);
    });
  });

  describe('Form Patching', () => {
    it('should patch form with preset values when preset is loaded', () => {
      fixture.detectChanges();
      expect(component.presetForm.value.title).toBe(mockPreset.title);
      expect(component.presetForm.value.gameclock_max).toBe(mockPreset.gameclock_max);
      expect(component.presetForm.value.initial_time_mode).toBe(mockPreset.initial_time_mode);
      expect(component.presetForm.value.initial_time_min_seconds).toBe(mockPreset.initial_time_min_seconds);
      expect(component.presetForm.value.period_clock_variant).toBe(mockPreset.period_clock_variant);
      expect(component.presetForm.value.direction).toBe(mockPreset.direction);
      expect(component.presetForm.value.on_stop_behavior).toBe(mockPreset.on_stop_behavior);
      expect(component.presetForm.value.period_mode).toBe(mockPreset.period_mode);
      expect(component.presetForm.value.period_count).toBe(mockPreset.period_count);
    });

    it('should patch form with non-720 gameclock_max', () => {
      const presetWith900: SportScoreboardPreset = {
        ...mockPreset,
        gameclock_max: 900,
      };

      mockPresetStore.presets = signal([presetWith900]);
      fixture = TestBed.createComponent(SportScoreboardPresetEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.presetForm.value.gameclock_max).toBe(900);
    });

    it('should patch form with zero initial time mode', () => {
      const presetWithZero: SportScoreboardPreset = {
        ...mockPreset,
        initial_time_mode: 'zero',
      };

      mockPresetStore.presets = signal([presetWithZero]);
      fixture = TestBed.createComponent(SportScoreboardPresetEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.presetForm.value.initial_time_mode).toBe('zero');
    });

    it('should patch form with min initial time mode', () => {
      const presetWithMin: SportScoreboardPreset = {
        ...mockPreset,
        initial_time_mode: 'min',
        initial_time_min_seconds: 300,
      };

      mockPresetStore.presets = signal([presetWithMin]);
      fixture = TestBed.createComponent(SportScoreboardPresetEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.presetForm.value.initial_time_mode).toBe('min');
      expect(component.presetForm.value.initial_time_min_seconds).toBe(300);
    });
  });

  describe('Form Validation', () => {
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
      component.presetForm.controls.initial_time_mode.setValue('min');
      fixture.detectChanges();
      expect(component.isCustomMinTimeMode()).toBe(true);
    });

    it('should not show custom min time field when initial_time_mode is max', () => {
      component.presetForm.controls.initial_time_mode.setValue('max');
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
    it('should create update payload with changed values', () => {
      component.presetForm.setValue({
        title: 'Updated Preset',
        gameclock_max: 900,
        initial_time_mode: 'min',
        initial_time_min_seconds: 300,
        period_clock_variant: 'cumulative',
        direction: 'up',
        on_stop_behavior: 'reset',
        is_qtr: false,
        is_time: false,
        is_playclock: false,
        is_downdistance: false,
        has_timeouts: false,
        has_playclock: false,
        period_mode: 'custom',
        period_count: 3,
        period_labels_input: 'leg_1, leg_2, leg_3',
        default_playclock_seconds: 35,
      });

      const expected: SportScoreboardPresetUpdate = {
        title: 'Updated Preset',
        gameclock_max: 900,
        initial_time_mode: 'min',
        initial_time_min_seconds: 300,
        period_clock_variant: 'cumulative',
        direction: 'up',
        on_stop_behavior: 'reset',
        is_qtr: false,
        is_time: false,
        is_playclock: false,
        is_downdistance: false,
        has_timeouts: false,
        has_playclock: false,
        period_mode: 'custom',
        period_count: 3,
        period_labels_json: ['leg_1', 'leg_2', 'leg_3'],
        default_playclock_seconds: 35,
      };

      component.onSubmit();
      expect(mockPresetStore.update).toHaveBeenCalledWith(1, expected);
    });

    it('should create update payload with only title changed', () => {
      component.presetForm.setValue({
        title: 'Updated Title',
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

      const expected: SportScoreboardPresetUpdate = {
        title: 'Updated Title',
        gameclock_max: 720,
        initial_time_mode: 'max',
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
      };

      component.onSubmit();
      expect(mockPresetStore.update).toHaveBeenCalledWith(1, expected);
    });

    it('should create update payload with non-720 gameclock_max', () => {
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

      const expected: SportScoreboardPresetUpdate = {
        title: 'Test Preset',
        gameclock_max: 900,
        initial_time_mode: 'max',
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
      };

      component.onSubmit();
      expect(mockPresetStore.update).toHaveBeenCalledWith(1, expected);
    });
  });

  describe('Form Submission', () => {
    it('should not submit form when invalid', () => {
      component.presetForm.controls.title.setValue('');
      component.onSubmit();
      expect(mockPresetStore.update).not.toHaveBeenCalled();
    });

    it('should not submit form when custom min time is invalid', () => {
      component.presetForm.controls.title.setValue('Test Preset');
      component.presetForm.controls.initial_time_mode.setValue('min');
      component.presetForm.controls.initial_time_min_seconds.setValue(null);
      component.onSubmit();
      expect(mockPresetStore.update).not.toHaveBeenCalled();
    });

    it('should submit form when valid', () => {
      component.presetForm.setValue({
        title: 'Updated Preset',
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
      expect(mockPresetStore.update).toHaveBeenCalled();
    });

    it('should not submit when loading', () => {
      mockPresetStore.loading = signal(true);
      fixture.detectChanges();
      component.onSubmit();
      expect(mockPresetStore.update).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to detail on cancel', () => {
      component.navigateToDetail();
      expect(mockNavigationHelper.toSportScoreboardPresetDetail).toHaveBeenCalledWith(1);
    });
  });
});
