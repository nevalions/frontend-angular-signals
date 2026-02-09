import { computed, inject, Injectable, Injector } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { SportScoreboardPreset, SportScoreboardPresetCreate, SportScoreboardPresetUpdate } from '../models/sport-scoreboard-preset.model';

@Injectable({
  providedIn: 'root',
})
export class SportScoreboardPresetStoreService {
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  presetsResource = httpResource<SportScoreboardPreset[]>(() => buildApiUrl('/api/sport-scoreboard-presets/'), { injector: this.injector });

  presets = computed(() => this.presetsResource.value() ?? []);
  loading = computed(() => this.presetsResource.isLoading());
  error = computed(() => this.presetsResource.error());

  presetById = computed(() => {
    const presetList = this.presets();
    const map = new Map<number, SportScoreboardPreset>();
    presetList.forEach((preset) => map.set(preset.id, preset));
    return map;
  });

  reload(): void {
    this.presetsResource.reload();
  }

  getAll(): Observable<SportScoreboardPreset[]> {
    return this.apiService.get<SportScoreboardPreset[]>('/api/sport-scoreboard-presets/').pipe(tap(() => this.reload()));
  }

  getById(id: number): Observable<SportScoreboardPreset> {
    return this.apiService.get<SportScoreboardPreset>(`/api/sport-scoreboard-presets/id/${id}/`);
  }

  create(data: SportScoreboardPresetCreate): Observable<SportScoreboardPreset> {
    return this.apiService.post<SportScoreboardPreset>('/api/sport-scoreboard-presets/', data).pipe(tap(() => this.reload()));
  }

  update(id: number, data: SportScoreboardPresetUpdate): Observable<SportScoreboardPreset> {
    return this.apiService.put<SportScoreboardPreset>('/api/sport-scoreboard-presets/', id, data, true).pipe(tap(() => this.reload()));
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete('/api/sport-scoreboard-presets', id).pipe(tap(() => this.reload()));
  }

  getSportsByPreset(id: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/sport-scoreboard-presets/id/${id}/sports`));
  }
}
