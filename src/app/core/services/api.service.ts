import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlingService } from './error.service';
import { buildApiUrl } from '../config/api.constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private errorHandlingService = inject(ErrorHandlingService);

  get<T>(endpoint: string): Observable<T> {
    const url = buildApiUrl(endpoint);
    console.log(`[API] GET ${url}`);
    return this.http.get<T>(url).pipe(
      tap(() => console.log(`[API] GET ${url} - Success`)),
      catchError((error: HttpErrorResponse) => this.errorHandlingService.handleError(error))
    );
  }

  post<T>(endpoint: string, data: unknown): Observable<T> {
    const url = buildApiUrl(endpoint);
    console.log(`[API] POST ${url}`, data);
    return this.http.post<T>(url, data).pipe(
      tap(() => console.log(`[API] POST ${url} - Success`)),
      catchError((error: HttpErrorResponse) => this.errorHandlingService.handleError(error))
    );
  }

  put<T>(endpoint: string, id: number, data: unknown): Observable<T> {
    const url = buildApiUrl(`${endpoint}/${id}`);
    console.log(`[API] PUT ${url}`, data);
    return this.http.put<T>(url, data).pipe(
      tap(() => console.log(`[API] PUT ${url} - Success`)),
      catchError((error: HttpErrorResponse) => this.errorHandlingService.handleError(error))
    );
  }

  delete(endpoint: string, id: number): Observable<void> {
    const url = buildApiUrl(`${endpoint}/${id}`);
    console.log(`[API] DELETE ${url}`);
    return this.http.delete<void>(url).pipe(
      tap(() => console.log(`[API] DELETE ${url} - Success`)),
      catchError((error: HttpErrorResponse) => this.errorHandlingService.handleError(error))
    );
  }

  customGet<T>(fullPath: string): Observable<T> {
    console.log(`[API] Custom GET ${fullPath}`);
    return this.http.get<T>(fullPath).pipe(
      tap(() => console.log(`[API] Custom GET ${fullPath} - Success`)),
      catchError((error: HttpErrorResponse) => this.errorHandlingService.handleError(error))
    );
  }
}
