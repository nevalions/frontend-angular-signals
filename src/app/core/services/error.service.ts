import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private router = inject(Router);

  handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[Error]', error);

    if (error.status === 404) {
      this.router.navigate(['/error404']);
    }

    return throwError(() => error);
  }
}
