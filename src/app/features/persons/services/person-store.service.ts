import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Person, PersonCreate, PersonUpdate } from '../models/person.model';

@Injectable({
  providedIn: 'root',
})
export class PersonStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  personsResource = httpResource<Person[]>(() => buildApiUrl('/api/persons/'), { injector: this.injector });

  persons = computed(() => this.personsResource.value() ?? []);
  loading = computed(() => this.personsResource.isLoading());
  error = computed(() => this.personsResource.error());

  reload(): void {
    this.personsResource.reload();
  }

  createPerson(personData: PersonCreate): Observable<Person> {
    return this.apiService.post<Person>('/api/persons/', personData).pipe(tap(() => this.reload()));
  }

  updatePerson(id: number, personData: PersonUpdate): Observable<Person> {
    return this.apiService.put<Person>('/api/persons/', id, personData).pipe(tap(() => this.reload()));
  }

  deletePerson(id: number): Observable<void> {
    return this.apiService.delete('/api/persons', id).pipe(tap(() => this.reload()));
  }
}
