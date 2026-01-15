import { computed, inject, Injectable, signal, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Person, PersonCreate, PersonUpdate, PersonSortBy, PersonsPaginatedResponse, PhotoUploadResponse } from '../models/person.model';
import { SortOrder } from '../../../core/models';

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
  search = signal<string>('');

  personsResource = rxResource({
    params: computed(() => ({
      page: this.page(),
      itemsPerPage: this.itemsPerPage(),
      sortBy: this.sortBy(),
      sortByTwo: this.sortByTwo(),
      sortOrder: this.sortOrder(),
      search: this.search(),
    })),
    stream: ({ params }) => {
      let httpParams = new HttpParams()
        .set('page', params.page.toString())
        .set('items_per_page', params.itemsPerPage.toString())
        .set('order_by', params.sortBy)
        .set('order_by_two', params.sortByTwo)
        .set('ascending', (params.sortOrder === 'asc').toString());

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

      return this.http.get<PersonsPaginatedResponse>(buildApiUrl('/api/persons/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  persons = computed(() => this.personsResource.value()?.data ?? []);
  loading = computed(() => this.personsResource.isLoading());
  error = computed(() => this.personsResource.error());

  totalCount = computed(() => this.personsResource.value()?.metadata.total_items ?? 0);
  totalPages = computed(() => this.personsResource.value()?.metadata.total_pages ?? 0);

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

  setSearch(query: string): void {
    this.search.set(query);
    this.page.set(1);
  }

  reload(): void {
    this.personsResource.reload();
  }

  uploadPersonPhoto(file: File): Observable<PhotoUploadResponse> {
    return this.apiService.uploadFile<PhotoUploadResponse>('/api/persons/upload_resize_photo', file);
  }

  createPerson(personData: PersonCreate): Observable<Person> {
    return this.apiService.post<Person>('/api/persons/', personData).pipe(tap(() => this.reload()));
  }

  updatePerson(id: number, personData: PersonUpdate): Observable<Person> {
    return this.apiService.put<Person>('/api/persons/', id, personData, true).pipe(tap(() => this.reload()));
  }

  deletePerson(id: number): Observable<void> {
    return this.apiService.delete('/api/persons', id).pipe(tap(() => this.reload()));
  }

  getPersonsNotInSport(
    sportId: number,
    page: number = 1,
    itemsPerPage: number = 100,
    search: string = ''
  ): Observable<PersonsPaginatedResponse> {
    let httpParams = new HttpParams()
      .set('sport_id', sportId.toString())
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString())
      .set('order_by', 'second_name')
      .set('order_by_two', 'id')
      .set('ascending', 'true');

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    return this.http.get<PersonsPaginatedResponse>(
      buildApiUrl(`/api/persons/not-in-sport/${sportId}`),
      { params: httpParams }
    );
  }
}
