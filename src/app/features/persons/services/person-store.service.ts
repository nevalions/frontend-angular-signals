import { computed, inject, Injectable, signal, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Person, PersonCreate, PersonUpdate, PersonSortBy, PersonsPaginatedResponse, PhotoUploadResponse } from '../models/person.model';
import { SortOrder } from '../../../core/models';
import { buildPaginationParams, createPaginationState } from '../../../core/utils/pagination-helper.util';

@Injectable({
  providedIn: 'root',
})
export class PersonStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);
  private pagination = createPaginationState();

  page = this.pagination.page;
  itemsPerPage = this.pagination.itemsPerPage;
  sortBy = signal<PersonSortBy>('second_name');
  sortByTwo = signal<PersonSortBy>('id');
  sortOrder = this.pagination.sortOrder;
  search = this.pagination.search;

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
      const httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      })
        .set('order_by', params.sortBy)
        .set('order_by_two', params.sortByTwo);

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
    this.pagination.setPage(page);
  }

  setItemsPerPage(size: number): void {
    this.pagination.setItemsPerPage(size);
  }

  setSort(sortBy: PersonSortBy, sortOrder: SortOrder): void {
    this.sortBy.set(sortBy);
    this.pagination.setSortOrder(sortOrder);
  }

  setSearch(query: string): void {
    this.pagination.setSearch(query);
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

  getPersonsNotInSport(sportId: number): Observable<Person[]> {
    return this.http.get<Person[]>(buildApiUrl(`/api/persons/not-in-sport/${sportId}/all`));
  }
}
