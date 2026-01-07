import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Position, PositionCreate, PositionUpdate } from '../models/position.model';

@Injectable({
  providedIn: 'root',
})
export class PositionStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  getPositionsBySportId(sportId: number): Observable<Position[]> {
    return this.http.get<Position[]>(buildApiUrl(`/api/sports/id/${sportId}/positions`));
  }

  createPosition(positionData: PositionCreate): Observable<Position> {
    return this.apiService.post<Position>('/api/positions/', positionData);
  }

  updatePosition(id: number, positionData: PositionUpdate): Observable<Position> {
    return this.apiService.put<Position>('/api/positions/', id, positionData, true);
  }

  deletePosition(id: number): Observable<void> {
    return this.apiService.delete('/api/positions', id);
  }
}
