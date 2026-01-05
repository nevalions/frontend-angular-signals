import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { SortBy, SortOrder } from '../../models/person.model';

@Component({
  selector: 'app-person-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.less',
})
export class PersonListComponent {
  private personStore = inject(PersonStoreService);

  persons = this.personStore.persons;
  loading = this.personStore.loading;
  error = this.personStore.error;

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortBy = signal<SortBy>('second_name');
  sortOrder = signal<SortOrder>('asc');

  sortedPersons = computed(() => {
    const persons = this.persons();
    const sortField = this.sortBy();
    const order = this.sortOrder();

    return [...persons].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (order === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  });

  totalPages = computed(() => Math.ceil(this.sortedPersons().length / this.itemsPerPage()));

  paginatedPersons = computed(() => {
    const sorted = this.sortedPersons();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();

    const start = (page - 1) * perPage;
    const end = start + perPage;

    return sorted.slice(start, end);
  });

  itemsPerPageOptions = [10, 20, 50];

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage.set(items);
    this.currentPage.set(1);
  }

  toggleSort(field: SortBy): void {
    if (this.sortBy() === field) {
      this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
  }

  getSortIcon(field: SortBy): string {
    if (this.sortBy() !== field) return '↕';
    return this.sortOrder() === 'asc' ? '↑' : '↓';
  }
}
