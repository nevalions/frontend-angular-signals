import { computed, inject, Injectable, signal, Injector, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Person, PersonCreate, PersonUpdate, PersonSortBy, SortOrder } from '../models/person.model';

interface CountResponse {
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PersonStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  page = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortBy = signal<PersonSortBy>('second_name');
  sortByTwo = signal<PersonSortBy>('id');
  sortOrder = signal<SortOrder>('asc');

  personsResource = rxResource({
    params: computed(() => ({
      page: this.page(),
      itemsPerPage: this.itemsPerPage(),
      sortBy: this.sortBy(),
      sortByTwo: this.sortByTwo(),
      sortOrder: this.sortOrder(),
    })),
    stream: ({ params }) => {
      const httpParams = new HttpParams()
        .set('page', params.page.toString())
        .set('items_per_page', params.itemsPerPage.toString())
        .set('order_by', params.sortBy)
        .set('order_by_two', params.sortByTwo)
        .set('ascending', (params.sortOrder === 'asc').toString());

      return this.http.get<Person[]>(buildApiUrl('/api/persons/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  persons = computed(() => this.personsResource.value() ?? []);
  loading = computed(() => this.personsResource.isLoading());
  error = computed(() => this.personsResource.error());

  totalCount = signal<number>(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.itemsPerPage()));

  constructor() {
    effect(() => {
      this.loadCount();
    });
  }

  loadCount(): void {
    this.http.get<CountResponse>(buildApiUrl('/api/persons/count')).subscribe({
      next: (response) => {
        this.totalCount.set(response.total);
      },
      error: (err) => {
        console.error('Failed to load persons count', err);
      },
    });
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setItemsPerPage(size: number): void {
    this.itemsPerPage.set(size);
    this.page.set(1);
  }

  setSort(sortBy: PersonSortBy, sortOrder: SortOrder): void {
    this.sortBy.set(sortBy);
    this.sortOrder.set(sortOrder);
    this.page.set(1);
  }

  reload(): void {
    this.personsResource.reload();
    this.loadCount();
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
