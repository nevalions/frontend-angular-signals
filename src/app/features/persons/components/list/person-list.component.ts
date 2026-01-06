import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter } from 'rxjs/operators';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonSortBy } from '../../models/person.model';
import {
  TuiCardMedium,
} from '@taiga-ui/layout';
import {
  TuiAvatar,
  TuiPagination,
} from '@taiga-ui/kit';
import {
  TuiButton,
  TuiIcon,
  TuiLoader,
  TuiTitle,
  TuiTextfield,
} from '@taiga-ui/core';

@Component({
  selector: 'app-person-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiCardMedium, TuiPagination, TuiAvatar, TuiTitle, TuiButton, TuiIcon, TuiLoader, TuiTextfield, ReactiveFormsModule],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.less',
})
export class PersonListComponent {
  private personStore = inject(PersonStoreService);
  private destroyRef = inject(DestroyRef);

  persons = this.personStore.persons;
  loading = this.personStore.loading;
  error = this.personStore.error;
  page = this.personStore.page;
  itemsPerPage = this.personStore.itemsPerPage;
  totalPages = this.personStore.totalPages;
  totalCount = this.personStore.totalCount;
  sortBy = this.personStore.sortBy;
  sortOrder = this.personStore.sortOrder;

  searchControl = new FormControl('');
  search = this.personStore.search;

  private shouldTriggerSearch(value: string | null): boolean {
    if (value === null) return false;
    return (value || '').length === 0 || value!.length >= 3;
  }

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        filter(this.shouldTriggerSearch)
      )
      .subscribe((value) => {
        this.personStore.setSearch(value || '');
      });
  }

  readonly itemsPerPageOptions = [10, 20, 50];

  getSortLabel(sortBy: PersonSortBy): string {
    switch (sortBy) {
      case 'first_name':
        return 'First Name';
      case 'second_name':
        return 'Second Name';
      default:
        return 'ID';
    }
  }

  toggleSort(sortBy: PersonSortBy): void {
    if (this.sortBy() === sortBy) {
      this.personStore.setSort(sortBy, this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.personStore.setSort(sortBy, 'asc');
    }
  }

  getSortIcon(sortBy: PersonSortBy): string {
    if (this.sortBy() !== sortBy) {
      return '@tui.chevron-up-down';
    }
    return this.sortOrder() === 'asc' ? '@tui.chevron-up' : '@tui.chevron-down';
  }

  onPageChange(pageIndex: number): void {
    this.personStore.setPage(pageIndex + 1);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.personStore.setItemsPerPage(itemsPerPage);
    this.personStore.setPage(1);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
