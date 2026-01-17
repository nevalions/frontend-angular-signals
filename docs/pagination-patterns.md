# Pagination Pattern

Canonical pattern for paginated lists using signals.

## Canonical Paginated Service Pattern

All paginated lists MUST follow this signal-based pattern:

```typescript
@Injectable({ providedIn: 'root' })
export class PaginatedStoreService {
  // Pagination state as signals
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Paginated resource using httpResource
  itemsResource = httpResource<PaginatedResponse<Item>>(() =>
    buildApiUrl(`/api/items?page=${this.currentPage()}&items_per_page=${this.itemsPerPage()}`),
  );

  // Computed properties for component use
  items = computed(() => this.itemsResource.value()?.data ?? []);
  totalCount = computed(() => this.itemsResource.value()?.metadata.total_items ?? 0);
  totalPages = computed(() => this.itemsResource.value()?.metadata.total_pages ?? 1);
  loading = computed(() => this.itemsResource.isLoading());
  error = computed(() => this.itemsResource.error());

  // Navigation methods
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  changeItemsPerPage(perPage: number): void {
    this.itemsPerPage.set(perPage);
    this.currentPage.set(1); // Reset to first page
  }

  // Reload current page
  reload(): void {
    this.itemsResource.reload();
  }
}

// Type definition
interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    page: number;
    items_per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
```

## Component Pattern

```typescript
@Component({
  selector: 'app-items-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './items-list.component.html',
})
export class ItemsListComponent {
  protected store = inject(PaginatedStoreService);

  // Expose store signals as component properties
  items = this.store.items;
  currentPage = this.store.currentPage;
  itemsPerPage = this.store.itemsPerPage;
  totalPages = this.store.totalPages;
  loading = this.store.loading;
  error = this.store.error;
}
```

## Template Pattern

```html
@if (loading()) {
  <div class="loading">Loading...</div>
} @else if (error()) {
  <div class="error">Error loading items</div>
} @else {
  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  }

  <div class="pagination">
    <button
      [disabled]="currentPage() === 1"
      (click)="store.previousPage()">
      Previous
    </button>

    @for (page of getPageRange(); track page) {
      <button
        [class.active]="currentPage() === page"
        (click)="store.goToPage(page)">
        {{ page }}
      </button>
    }

    <button
      [disabled]="currentPage() === totalPages()"
      (click)="store.nextPage()">
      Next
    </button>

    <select (change)="store.changeItemsPerPage($any($event.target).value)">
      <option [value]="10" [selected]="itemsPerPage() === 10">10 per page</option>
      <option [value]="25" [selected]="itemsPerPage() === 25">25 per page</option>
      <option [value]="50" [selected]="itemsPerPage() === 50">50 per page</option>
    </select>
  </div>
}
```

## Query Parameters

Backend paginated endpoints support these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based) |
| `items_per_page` | number | 20 | Items per page (max 100) |
| `order_by` | string | - | First sort column |
| `order_by_two` | string | - | Second sort column |
| `ascending` | boolean | - | Sort order (true=asc, false=desc) |
| `search` | string | - | Search query for text search |
| `user_id` | string | - | Filter by user_id (privacy) |
| `isprivate` | boolean | - | Filter by isprivate status |

Example usage in service:

```typescript
itemsResource = httpResource<PaginatedResponse<Item>>(() =>
  buildApiUrl(`/api/items`, {
    page: this.currentPage(),
    items_per_page: this.itemsPerPage(),
    order_by: this.sortColumn(),
    ascending: this.sortDirection() === 'asc',
    search: this.searchQuery(),
  })
);
```

## Pagination Best Practices

1. **State in Service Only** - Never put pagination state in components
2. **Computed Totals** - Always derive `totalPages` from `metadata.total_pages`
3. **Page Validation** - Validate page bounds before navigation
4. **Reset on Filter Change** - Reset to page 1 when filters or `itemsPerPage` change
5. **Loading States** - Show loading indicator during page transitions
6. **Error Handling** - Display error messages and provide retry option
7. **URL Synchronization** (Optional): Sync page number with query params for deep linking

## Pagination Anti-Patterns

```typescript
// ❌ BAD - Pagination state in component
@Component({ ... })
export class BadListComponent {
  currentPage = 1;
  itemsPerPage = 10;

  loadPage(): void {
    this.http.get(`/api/items?page=${this.currentPage}`);
  }
}

// ❌ BAD - Imperative pagination without signals
items: Item[] = [];
currentPage = 1;

onNextPage(): void {
  this.currentPage++;
  this.loadPage();
}

// ❌ BAD - No page boundary validation
goToPage(page: number): void {
  this.currentPage = page; // Could go to page 999
  this.loadPage();
}

// ✅ GOOD - All pagination state in service
items = computed(() => this.store.items());
currentPage = this.store.currentPage;
totalPages = computed(() => this.store.totalPages());

goToPage(page: number): void {
  this.store.goToPage(page); // Validation in service
}
```

## Testing Pagination

```typescript
describe('PaginatedStoreService', () => {
  it('should navigate to next page', () => {
    service.currentPage.set(1);
    service.nextPage();
    expect(service.currentPage()).toBe(2);
  });

  it('should not navigate past last page', () => {
    service.currentPage.set(10);
    service.nextPage();
    expect(service.currentPage()).toBe(10);
  });

  it('should calculate total pages correctly', () => {
    vi.spyOn(service.itemsResource, 'value').mockReturnValue({
      data: [],
      metadata: {
        page: 1,
        items_per_page: 10,
        total_items: 95,
        total_pages: 10,
        has_next: true,
        has_previous: false,
      },
    });
    expect(service.totalPages()).toBe(10);
  });

  it('should reset to page 1 when items per page changes', () => {
    service.currentPage.set(5);
    service.changeItemsPerPage(25);
    expect(service.currentPage()).toBe(1);
    expect(service.itemsPerPage()).toBe(25);
  });
});
```

## URL Synchronization Pattern (Optional)

```typescript
@Injectable({ providedIn: 'root' })
export class PaginatedStoreService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentPage = toSignal(
    this.route.queryParamMap.pipe(
      map(params => Number(params.get('page')) || 1)
    ),
    { initialValue: 1 }
  );

  itemsPerPage = toSignal(
    this.route.queryParamMap.pipe(
      map(params => Number(params.get('items_per_page')) || 10)
    ),
    { initialValue: 10 }
  );

  itemsResource = httpResource<PaginatedResponse<Item>>(() =>
    buildApiUrl(`/api/items?page=${this.currentPage()}&items_per_page=${this.itemsPerPage()}`),
  );

  private syncUrl = effect(() => {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage(),
        items_per_page: this.itemsPerPage(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}
```

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage
- [Service Patterns](./service-patterns.md) - Service patterns
- [Testing Patterns](./testing-patterns.md) - Testing patterns
