import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../../core/services/api.service';
import { SportScoreboardPresetStoreService } from './sport-scoreboard-preset-store.service';
import {
  SportScoreboardPreset,
  SportScoreboardPresetCreate,
  SportScoreboardPresetUpdate,
} from '../models/sport-scoreboard-preset.model';

describe('SportScoreboardPresetStoreService', () => {
  it('passes period_clock_variant in create payload', () => {
    const mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      customGet: vi.fn(),
    } as unknown as ApiService;

    const createdPreset: SportScoreboardPreset = {
      id: 11,
      title: 'Soccer',
      gameclock_max: 2700,
      initial_time_mode: 'max',
      initial_time_min_seconds: null,
      period_clock_variant: 'cumulative',
      direction: 'down',
      on_stop_behavior: 'hold',
      is_qtr: true,
      is_time: true,
      is_playclock: false,
      is_downdistance: false,
      has_timeouts: true,
      has_playclock: false,
      period_mode: 'half',
      period_count: 2,
      period_labels_json: null,
      default_playclock_seconds: null,
    };

    (mockApi.post as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(createdPreset));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SportScoreboardPresetStoreService,
        { provide: ApiService, useValue: mockApi },
      ],
    });

    const service = TestBed.inject(SportScoreboardPresetStoreService);
    const payload: SportScoreboardPresetCreate = {
      title: 'Soccer',
      period_clock_variant: 'cumulative',
      gameclock_max: 2700,
    };

    service.create(payload).subscribe();

    expect(mockApi.post).toHaveBeenCalledWith('/api/sport-scoreboard-presets/', payload);
  });

  it('passes period_clock_variant in update payload', () => {
    const mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      customGet: vi.fn(),
    } as unknown as ApiService;

    const updatedPreset = {
      id: 11,
      title: 'Soccer',
      period_clock_variant: 'per_period',
    } as unknown as SportScoreboardPreset;

    (mockApi.put as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(updatedPreset));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SportScoreboardPresetStoreService,
        { provide: ApiService, useValue: mockApi },
      ],
    });

    const service = TestBed.inject(SportScoreboardPresetStoreService);
    const payload: SportScoreboardPresetUpdate = {
      period_clock_variant: 'per_period',
    };

    service.update(11, payload).subscribe();

    expect(mockApi.put).toHaveBeenCalledWith('/api/sport-scoreboard-presets/', 11, payload, true);
  });
});
