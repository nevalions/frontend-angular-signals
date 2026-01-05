import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiTable, TuiTablePagination, type TuiSortChange, type TuiSortDirection, type TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { PersonStoreService } from '../../services/person-store.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiTable, TuiTablePagination],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.less',
})
export class PersonListComponent {
  private personStore = inject(PersonStoreService);

  persons = this.personStore.persons;
  loading = this.personStore.loading;
  error = this.personStore.error;

  page = signal<number>(0);
  size = signal<number>(10);
  sortDirection = signal<TuiSortDirection>(1);
  sortBy = signal<keyof Person | null>('second_name');

  readonly itemsPerPageOptions = [10, 20, 50];
  readonly columns = ['first_name', 'second_name', 'person_photo_url'] as const;

  sortedPersons = computed(() => {
    const persons = this.persons();
    const direction = this.sortDirection();
    const key = this.sortBy();

    if (!key) return persons;

    return [...persons].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * direction;
      }

      return 0;
    });
  });

  paginatedPersons = computed(() => {
    const persons = this.sortedPersons();
    const currentPage = this.page();
    const currentPageSize = this.size();

    const start = currentPage * currentPageSize;
    const end = start + currentPageSize;

    return persons.slice(start, end);
  });

  onSortChange({ sortKey, sortDirection }: TuiSortChange<Person>): void {
    this.sortBy.set(sortKey);
    this.sortDirection.set(sortDirection);
  }

  onPaginationChange({ page, size }: TuiTablePaginationEvent): void {
    this.page.set(page);
    this.size.set(size);
  }
}
