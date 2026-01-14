# AGENTS.md - Development Guidelines

## UI/Styles Development

**IMPORTANT**: When editing styles and UI components, use the built-in MCP tools:

- Use `angular-cli_*` MCP tools for Angular-specific tasks
- Use `taiga-ui_*` MCP tools for Taiga UI component library
- Delegate to the `frontend-angular-taiga` agent for Angular + Taiga UI development tasks with Playwright testing

### Service Patterns

#### Canonical Signal-Based Service Pattern

## Important Notes

- All components must be standalone (no NgModules)
- Signal based angular project
- All components must use `ChangeDetectionStrategy.OnPush`
- Prefer signals over imperative state for all reactive patterns
- Paginated lists MUST follow the canonical Paginated List Pattern (see Service Patterns section)

## Angular Signals Best Practices

### Component Requirements

All components MUST follow these signal patterns:

1. **Change Detection Strategy**

   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush, // REQUIRED for all components
   })
   ```

2. **Signals for State**
   - Use `signal()` for local writable state
   - Use `computed()` for derived state
   - Use `toSignal()` to convert Observables to signals
   - Avoid imperative state variables that should be signals

3. **Reactive Route Params**

   ```typescript
   // GOOD - Reactive route params as signal
   import { toSignal } from '@angular/core/rxjs-interop';

   seasonId = toSignal(
     this.route.paramMap.pipe(map(params => Number(params.get('id')))),
     { initialValue: null }
   );

   // BAD - Imperative route param
   seasonId: number | null = null;
   ngOnInit() {
     this.seasonId = Number(this.route.snapshot.paramMap.get('id'));
   }
   ```

4. **Computed Signals for Lookup**

   ```typescript
   // GOOD - Computed signal for reactive lookup
   season = computed(() => {
     const id = this.seasonId();
     if (!id) return null;
     return this.seasonStore.seasons().find(s => s.id === id) || null;
   });

   // BAD - Imperative state
   season: Season | null = null;
   ngOnInit() {
     this.season = this.seasonStore.seasons().find(s => s.id === this.id) || null;
   }
   ```

5. **Effect() Usage**
   - Use sparingly - only for non-reactive API side effects
   - Avoid calling methods that read signals inside effects
   - Use `untracked()` when calling external functions

   ```typescript
   private patchFormOnSeasonChange = effect(() => {
     const season = this.season();
     if (season) {
       this.seasonForm.patchValue({
         year: season.year,
         description: season.description,
       });
     }
   });
   ```

6. **Signal Inputs/Outputs**

   ```typescript
   // Read-only signal input
   seasonId = input.required<number>();

   // Optional signal input with default
   disabled = input(false);

   // Signal output
   seasonChange = output<Season>();

   // Signal model for two-way binding
   checked = model(false);
   ```

7. **Reactive Forms (Traditional)**

   ```typescript
   import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

   // ✅ CORRECT - Traditional Reactive Forms with validation
   seasonForm = this.fb.group({
     year: ['', [Validators.required, Validators.min(1900)]],
     description: [''],
   });

   // Template usage
   // <input formControlName="year" />
   // <input formControlName="description" />
   // @if (seasonForm.get('year')?.errors?.required) { <div>Year is required</div> }
   ```

   **⚠️ IMPORTANT - DO NOT use Signal Forms:**
   - Signal Forms (`form()` from `@angular/forms/signals`) are in BETA
   - Use traditional Reactive Forms (`FormBuilder`, `FormGroup`, `FormControl`)
   - Signal Forms may have breaking changes in future releases
   - Use `Validators.required`, `Validators.min` etc. from `@angular/forms`

8. **linkedSignal() for Advanced Derived State**

   ```typescript
   // Dependent writable state
   filteredList = linkedSignal((options) =>
     computed(() => {
       const list = this.items();
       const filter = this.filter();
       return list.filter((item) => item.type === filter);
     }),
   );

   // Or simpler form for read-only derived with dependencies
   filteredList = linkedSignal(() => {
     return this.items().filter((item) => item.type === this.filter());
   });
   ```

9. **Experimental Features**

   **⚠️ IMPORTANT: `signals: true` is NOT AVAILABLE in Angular 21.x**

   The experimental `signals: true` component decorator option does not exist in Angular 21.0.6 and cannot be used. The TypeScript compiler will reject this option with: "Object literal may only specify known properties, and 'signals' does not exist in type 'Component'."

   See `STAF-119-RESEARCH.md` for comprehensive evaluation.

   **What IS Available (Stable):**

   Function-based component APIs can be used without `signals: true`:

   ```typescript
   import { Component, input, output, model, viewChild } from '@angular/core';

   @Component({
     selector: 'app-example',
     standalone: true,
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   export class ExampleComponent {
     // Signal inputs (replaces @Input)
     title = input.required<string>();

     // Signal outputs (replaces @Output)
     save = output<void>();

     // Two-way binding (replaces [(ngModel)])
     checked = model(false);

     // Signal queries (replaces @ViewChild)
     button = viewChild.required('button');
   }
   ```

   **Recommendation:**
   - DO NOT use `signals: true` - it does not exist in Angular 21.x
   - DO use function-based component APIs (`input()`, `output()`, `model()`) for new components
   - DO continue using `signal()`, `computed()`, `effect()` for state management
   - DO monitor Angular release notes for stable `signals: true` announcement
   - Re-evaluate in Q2 2026 or when Angular team announces stable release

   See `STAF-119-RESEARCH.md` for detailed evaluation, including:
   - What `signals: true` would do if available
   - Current status in Angular 21.x
   - Comparison with available function-based APIs
   - Re-evaluation criteria and timeline

### Service Patterns

#### httpResource vs rxResource Decision Matrix

**Use `httpResource()` for:**

- Simple GET requests without complex query logic
- Data that needs automatic loading based on reactive dependencies
- Requests that don't need RxJS operators (debounce, retry, etc.)
- Standard CRUD list/data fetching patterns
- Detail views by ID (direct URL binding)
- When you want simpler, cleaner code

```typescript
// ✅ GOOD - Simple data fetching
seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

// ✅ GOOD - Detail by ID
seasonResource = httpResource<Season>(() => buildApiUrl(`/api/seasons/${id}`));

// ✅ GOOD - With reactive dependencies
seasonsBySportResource = httpResource<Season[]>(() =>
  buildApiUrl(`/api/sports/${sportId()}/seasons`),
);
```

**Use `rxResource()` for:**

- Complex async patterns with RxJS operators
- Search with debouncing and minimum length filters
- Requests needing retry logic, timeout handling, or complex error recovery
- Multiple interdependent API calls or orchestration
- Request cancellation and race condition handling
- Custom request/response transformation
- Complex filtering or query composition

```typescript
// ✅ GOOD - Complex search with RxJS operators
searchQuery = signal('');

searchResource = rxResource<Season[]>({
  request: computed(() => ({
    url: buildApiUrl('/api/seasons/'),
    params: { q: this.searchQuery() },
  })),
  loader: (params) =>
    this.http.get<Season[]>(params.url, { params: params.params }).pipe(
      debounceTime(300),
      filter(() => this.searchQuery().length >= 2),
      retry(3),
      catchError((err) => {
        this.errorService.log(err);
        return of([]);
      }),
    ),
});
```

```typescript
// ✅ GOOD - Complex request orchestration
complexDataResource = rxResource<CombinedData>({
  request: computed(() => ({
    userId: this.userId(),
    seasonId: this.seasonId(),
  })),
  loader: (params) =>
    this.http.get<User>(`/api/users/${params.request.userId}`).pipe(
      switchMap((user) =>
        this.http
          .get<Season[]>(`/api/users/${params.request.userId}/seasons`)
          .pipe(map((seasons) => ({ user, seasons, filteredSeasons: seasons }))),
      ),
      timeout(5000),
      catchError((err) => {
        this.errorService.log(err);
        return of({ user: null, seasons: [], filteredSeasons: [] });
      }),
    ),
});
```

**Decision Matrix:**

| Scenario                    | Recommended                                      | Reasoning                                   |
| --------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Simple list fetch           | `httpResource()`                                 | Simpler, cleaner API                        |
| Detail by ID                | `httpResource()`                                 | Direct URL binding                          |
| Search with debounce        | `rxResource()`                                   | Need debounceTime operator                  |
| Auto-retry on failure       | `rxResource()`                                   | Need retry operator                         |
| Request cancellation        | Both work, `rxResource()` has built-in switchMap | Both cancel previous requests               |
| Response transformation     | Both work, `httpResource()` has `parse`          | Use `httpResource().parse` for simple cases |
| Multiple dependent requests | `rxResource()`                                   | Need switchMap/combineLatest                |
| Timeout handling            | `rxResource()`                                   | Need timeout operator                       |
| Complex error recovery      | `rxResource()`                                   | Need catchError + retryWhen                 |
| Rate limiting               | `rxResource()`                                   | Need throttleTime/sampleTime                |
| Data polling                | `rxResource()`                                   | Need interval/timer                         |

**Decision Criteria:**

- Need RxJS operators? → Use `rxResource()`
- Need debouncing/filtering? → Use `rxResource()`
- Need retry logic? → Use `rxResource()`
- Simple GET with reactive deps? → Use `httpResource()`
- Want less boilerplate? → Use `httpResource()`
- Need request orchestration? → Use `rxResource()`
- Need timeout handling? → Use `rxResource()`

#### Current Codebase Evaluation

**Evaluated Services (STAF-117):**

All current services correctly use `httpResource()` for simple GET requests:

1. **SeasonStoreService** - `httpResource<Season[]>()` for seasons list
2. **TournamentStoreService** - `httpResource<Tournament[]>()` for tournaments list
3. **SportStoreService** - `httpResource<Sport[]>()` for sports list
4. **PersonStoreService** - `httpResource<Person[]>()` for persons list

**Evaluation Result:** ✅ All services appropriately use `httpResource()`

**Rationale:**

- All current use cases are simple GET requests without complex query logic
- No need for RxJS operators (debounce, retry, switchMap, etc.)
- Direct URL-based fetching with no complex parameter transformations
- Standard CRUD list/data fetching patterns

**Potential Future Use Cases for `rxResource()`:**

1. **Search functionality** - When implementing search with debouncing (debounceTime, filter)
2. **Auto-refresh with error recovery** - Network failures with retry logic
3. **Complex filtering** - Multiple query parameters changing frequently with throttle/debounce
4. **Data composition** - Combining multiple API calls with switchMap/combineLatest
5. **Progressive loading** - Timeout handling with fallback data
6. **Real-time data polling** - Using interval/timer with automatic cleanup

**Proof-of-Concept Examples:**

See `SeasonStoreService.searchSeasons()` for a practical example of `rxResource()` usage with search debouncing.

#### Paginated List Pattern

**Canonical Paginated Service Pattern:**

All paginated lists MUST follow this signal-based pattern:

```typescript
@Injectable({ providedIn: 'root' })
export class PaginatedStoreService {
  // Pagination state as signals
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Paginated resource using httpResource
  itemsResource = httpResource<PaginatedResponse<Item>>(() =>
    buildApiUrl(`/api/items?page=${this.currentPage()}&per_page=${this.itemsPerPage()}`),
  );

  // Computed properties for component use
  items = computed(() => this.itemsResource.value()?.items ?? []);
  totalCount = computed(() => this.itemsResource.value()?.total ?? 0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.itemsPerPage()));
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
  items: T[];
  total: number;
  page: number;
  per_page: number;
}
```

**Component Pattern:**

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

**Template Pattern:**

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

**Pagination Best Practices:**

1. **State in Service Only** - Never put pagination state in components
2. **Computed Totals** - Always derive `totalPages` from `totalCount` and `itemsPerPage`
3. **Page Validation** - Validate page bounds before navigation
4. **Reset on Filter Change** - Reset to page 1 when filters or `itemsPerPage` change
5. **Loading States** - Show loading indicator during page transitions
6. **Error Handling** - Display error messages and provide retry option
7. **URL Synchronization** (Optional): Sync page number with query params for deep linking

**Pagination Anti-Patterns:**

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

**Testing Pagination:**

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
      items: [],
      total: 95,
      page: 1,
      per_page: 10,
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

**URL Synchronization Pattern (Optional):**

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
      map(params => Number(params.get('per_page')) || 10)
    ),
    { initialValue: 10 }
  );

  itemsResource = httpResource<PaginatedResponse<Item>>(() =>
    buildApiUrl(`/api/items?page=${this.currentPage()}&per_page=${this.itemsPerPage()}`),
  );

  private syncUrl = effect(() => {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage(),
        per_page: this.itemsPerPage(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}
```

#### Service Anti-Patterns

```typescript
// ❌ BAD - Don't use toSignal() in services to expose Observables
@Injectable({ providedIn: 'root' })
export class BadService {
  items$ = this.http.get<Item[]>('/items');
  items = toSignal(this.items$); // Memory leak risk
}

// ✅ GOOD - Use httpResource or expose Observable directly
@Injectable({ providedIn: 'root' })
export class GoodService {
  itemsResource = httpResource<Item[]>(() => '/items');
  // Or expose Observable for components to convert
  items$ = this.http.get<Item[]>('/items');
}
```

```typescript
// ❌ BAD - Don't use httpResource for mutations
createItem(item: Item) {
  httpResource(() => ({ url: '/items', method: 'POST', body: item }));
}

// ✅ GOOD - Use HttpClient for mutations
createItem(item: Item): Observable<Item> {
  return this.http.post<Item>('/items', item);
}
```

1. **httpResource for Async Data**

   ```typescript
   @Injectable({ providedIn: 'root' })
   export class SeasonStoreService {
     seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

     seasons = computed(() => this.seasonsResource.value() ?? []);
     loading = computed(() => this.seasonsResource.isLoading());
     error = computed(() => this.seasonsResource.error());
   }
   ```

2. **Signal Immutability**
   - Never mutate signal values directly
   - Always use `.set()` or `.update()` for writable signals
   - Computed signals are read-only by design

3. **Signal Testing Utilities**
   - Located in separate library: `libs/signal-testing-utils`
   - Provides helpers for testing signals and effects

4. **Navigation Helper Pattern**

   Use `NavigationHelperService` for common navigation routes to avoid repetition:

   ```typescript
   import { NavigationHelperService } from '../../../shared/services/navigation-helper.service';

   @Component({ ... })
   export class ExampleComponent {
     private navigationHelper = inject(NavigationHelperService);

     cancel(): void {
       this.navigationHelper.toTournamentsList(this.sportId, this.year);
     }

     onSubmit(): void {
       this.service.save().subscribe(() => {
         this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
       });
     }
   }
   ```

   Available methods:

   ```typescript
   // Tournaments
   toTournamentsList(sportId: number | string, year: number | string)
   toTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string)
   toTournamentEdit(sportId: number | string, year: number | string, tournamentId: number | string)
   toTournamentCreate(sportId: number | string, year: number | string)

   // Sports
   toSportDetail(sportId: number | string, year?: number | string, tab?: string)
   toSportEdit(sportId: number | string)
   toSportsList()

   // Teams
   toTeamDetail(sportId: number | string, teamId: number | string, year?: number | string)
   toTeamEdit(sportId: number | string, teamId: number | string)
   toTeamCreate(sportId: number | string)

   // Persons
   toPersonsList()
   toPersonDetail(id: number | string)
   toPersonEdit(id: number | string)
   toPersonCreate()

   // System
   toHome()
   toError404()
   ```

5. **Delete Confirmation Pattern**

   Use `withDeleteConfirm()` utility from `src/app/core/utils/delete-helper.util.ts` for consistent delete operations:

   ```typescript
   import { withDeleteConfirm } from '../../../../core/utils/delete-helper.util';

   @Component({ ... })
   export class ExampleComponent {
     private dialogs = inject(TuiDialogService);
     private alerts = inject(TuiAlertService);

     deleteEntity(): void {
       const entity = this.entity();
       const id = entity?.id;
       if (!entity || !id) return;

       withDeleteConfirm(
         this.dialogs,
         this.alerts,
         {
           label: `Delete ${entity.name}?`,
           content: 'This action cannot be undone!',
         },
         () => this.store.deleteEntity(id),
         () => this.navigateBack(),
         'Entity'
       );
     }
   }
   ```

   **Benefits:**
   - ✅ Consistent UX across all delete operations
   - ✅ Automatic success/error alerts
   - ✅ Confirmation dialog with destructive appearance
   - ✅ Reusable and maintainable
   - ✅ Type-safe with generics

   **Behavior:**
   - Shows Taiga UI confirm dialog with `appearance: 'error'`
   - On confirmation: executes delete operation
   - On success: Shows positive alert with 3s auto-close, then navigates
   - On error: Shows negative alert (stays open until user closes), stays on page
   - On cancel: Closes dialog, no action taken

   **Import Requirements:**
   ```typescript
   import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
   import { withDeleteConfirm } from '../../../../core/utils/delete-helper.util';
   ```

### Template Requirements

1. **Modern Control Flow**
   - Use `@if` instead of `*ngIf`
   - Use `@for` instead of `*ngFor`
   - Use `track` for list iteration

2. **Signal Bindings**

   ```html
   <!-- GOOD - Direct signal binding -->
   @if (loading()) {
   <div>Loading...</div>
   } @for (season of seasons(); track season.id) {
   <div>{{ season.year }}</div>
   }
   ```

3. **Class Bindings**
   - Use `[class.name]` instead of `ngClass`
   - Use `[style.property]` instead of `ngStyle`

### Testing Patterns

1. **Test Setup**

   ```typescript
   import { TestBed } from '@angular/core/testing';

   beforeEach(() => {
     TestBed.configureTestingModule({
       /* ... */
     });
     fixture = TestBed.createComponent(MyComponent);
     component = fixture.componentInstance;
   });
   ```

2. **Signal Testing Utilities**

   ```typescript
   import { createMockSignal, createMockComputed } from '@your-org/signal-testing-utils';

   const mockSeasons = createMockSignal([]);
   const mockLoading = createMockComputed(false);
   ```

3. **Avoid Mocking Signal Methods**
   - Use real signals in tests when possible
   - Only mock services, not signal implementations
   - Test reactivity through actual signal updates

4. **Component Testing Patterns**

   **Form Validation Tests**

   ```typescript
   it('should handle year validation - min 1900', () => {
     component.yearControl?.setValue(1899);
     expect(component.yearControl?.valid).toBe(false);
     expect(component.yearControl?.errors?.['min']).toBeDefined();
   });

   it('should require year field', () => {
     component.yearControl?.setValue('');
     expect(component.yearControl?.hasError('required')).toBe(true);
   });

   it('should provide yearControl accessor', () => {
     expect(component.yearControl).toBeDefined();
     expect(component.yearControl).toBe(component.seasonForm.get('year'));
   });
   ```

   **Signal-Based State Tests**

   ```typescript
   it('should expose seasons from store', () => {
     const seasons = component.seasons();
     expect(seasons).toEqual(mockSeasons);
   });

   it('should expose loading state from store', () => {
     expect(component.loading()).toBe(false);
   });

   it('should handle loading state correctly', () => {
     storeMock.loading = vi.fn(() => true);
     const newComponent = TestBed.createComponent(MyComponent).componentInstance;
     expect(newComponent.loading()).toBe(true);
   });
   ```

   **Navigation After Operations**

   ```typescript
   it('should navigate to list after successful creation', () => {
     component.seasonForm.setValue({ year: 2024, description: 'Test' });
     component.onSubmit();
     expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
   });
   ```

    **Delete Confirmation Tests**

    ```typescript
    it('should show confirm dialog and delete on confirmation', () => {
      const dialogOpenSpy = vi.spyOn(dialogsMock, 'open').mockReturnValue(of(true));
      const alertOpenSpy = vi.spyOn(alertsMock, 'open').mockReturnValue(of({}));

      component.deleteSeason();

      expect(dialogOpenSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          label: 'Delete season 2024?',
          size: 's',
          data: expect.objectContaining({
            content: 'This action cannot be undone!',
            appearance: 'error',
          }),
        })
      );
      expect(storeMock.deleteSeason).toHaveBeenCalledWith(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
      expect(alertOpenSpy).toHaveBeenCalledWith('Season deleted successfully', expect.any(Object));
    });

    it('should not delete when dialog is cancelled', () => {
      const dialogOpenSpy = vi.spyOn(dialogsMock, 'open').mockReturnValue(of(false));
      const alertOpenSpy = vi.spyOn(alertsMock, 'open');

      component.deleteSeason();

      expect(dialogOpenSpy).toHaveBeenCalled();
      expect(storeMock.deleteSeason).not.toHaveBeenCalled();
      expect(alertOpenSpy).not.toHaveBeenCalled();
    });

    it('should show error alert and stay on page when delete fails', () => {
      const error = new Error('Network error');
      const dialogOpenSpy = vi.spyOn(dialogsMock, 'open').mockReturnValue(of(true));
      const alertOpenSpy = vi.spyOn(alertsMock, 'open').mockReturnValue(of({}));
      vi.spyOn(storeMock, 'deleteSeason').mockReturnValue(throwError(() => error));

      component.deleteSeason();

      expect(alertOpenSpy).toHaveBeenCalledWith(
        'Failed to delete: Network error',
        expect.objectContaining({
          label: 'Error',
          appearance: 'negative',
        })
      );
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
    ```

   **Null/Not-Found Handling**

   ```typescript
   it('should return null when season is not found', () => {
     const id99RouteMock = { paramMap: of({ get: (_key: string) => '99' }) };
     TestBed.configureTestingModule({
       providers: [
         { provide: ActivatedRoute, useValue: id99RouteMock },
         { provide: SeasonStoreService, useValue: storeMock },
       ],
     });
     const newComponent = TestBed.createComponent(MyComponent).componentInstance;
     expect(newComponent.season()).toBe(null);
   });
   ```

5. **Service Testing Patterns**

   **CRUD Operation Tests**

   ```typescript
   it('should call createSeason with correct data', () => {
     const seasonData: SeasonCreate = { year: 2024, description: 'Test' };
     service.createSeason(seasonData).subscribe();
     const req = httpMock.expectOne(buildApiUrl('/api/seasons/'));
     req.flush({ id: 1, year: 2024, description: 'Test' } as Season);
     expect(req.request.method).toBe('POST');
     expect(req.request.body).toEqual(seasonData);
   });

   it('should handle createSeason error', () => {
     service.createSeason(seasonData).subscribe({ error: (err) => expect(err).toBeTruthy() });
     const req = httpMock.expectOne(buildApiUrl('/api/seasons/'));
     req.flush('Error', { status: 400, statusText: 'Bad Request' });
   });
   ```

   **Signal Property Validation**

   ```typescript
   it('should have seasons signal', () => {
     expect(service.seasons).toBeDefined();
     expect(typeof service.seasons === 'function').toBe(true);
   });

   it('should have seasonsResource', () => {
     expect(service.seasonsResource).toBeDefined();
   });
   ```

   **Reload Method Tests**

   ```typescript
   it('should have reload method', () => {
     expect(service.reload).toBeDefined();
     expect(typeof service.reload).toBe('function');
   });

   it('should trigger reload of seasonsResource', () => {
     const reloadSpy = vi.spyOn(service.seasonsResource, 'reload');
     service.reload();
     expect(reloadSpy).toHaveBeenCalled();
   });
   ```

6. **Model Testing Patterns**

   ```typescript
   describe('SeasonCreate interface', () => {
     it('should accept valid SeasonCreate object', () => {
       const seasonData: SeasonCreate = { year: 2024, description: 'New season' };
       expect(seasonData.year).toBe(2024);
       expect(seasonData.description).toBe('New season');
     });

     it('should accept SeasonCreate without description', () => {
       const seasonData: SeasonCreate = { year: 2024 };
       expect(seasonData.year).toBe(2024);
       expect(seasonData.description).toBeUndefined();
     });

     it('should handle year as number', () => {
       const season: Season = { id: 1, year: 2024 };
       expect(typeof season.year).toBe('number');
     });
   });
   ```

### Common Anti-Patterns

#### Service Anti-Patterns

❌ **BAD - Don't use toSignal() in services to expose Observables**

```typescript
@Injectable({ providedIn: 'root' })
export class BadService {
  items$ = this.http.get<Item[]>('/items');
  items = toSignal(this.items$); // Memory leak risk
}
```

✅ **GOOD - Use httpResource or expose Observable directly**

```typescript
@Injectable({ providedIn: 'root' })
export class GoodService {
  itemsResource = httpResource<Item[]>(() => '/items');
  // Or expose Observable for components to convert
  items$ = this.http.get<Item[]>('/items');
}
```

#### Mutation Anti-Patterns

❌ **BAD - Don't use httpResource for mutations**

```typescript
createItem(item: Item) {
  httpResource(() => ({ url: '/items', method: 'POST', body: item }));
}
```

✅ **GOOD - Use HttpClient for mutations**

```typescript
createItem(item: Item): Observable<Item> {
  return this.http.post<Item>('/items', item);
}
```

#### Effect Anti-Patterns

❌ **BAD - Don't use effect() for state propagation**

```typescript
items = signal<Item[]>([]);
filteredItems = signal<Item[]>([]);

constructor() {
  effect(() => {
    this.filteredItems.set(
      this.items().filter(item => item.active)
    ); // Violates best practices
  });
}
```

✅ **GOOD - Use computed for derived state**

```typescript
items = signal<Item[]>([]);
filteredItems = computed(() => this.items().filter((item) => item.active));
```

#### Lifecycle Anti-Patterns

❌ **BAD - Don't use ngOnChanges with signals**

```typescript
@Input({ required: true }) seasonId!: number;
ngOnChanges() {
  // Reacting to input changes
}
```

✅ **GOOD - Use computed for reactive transformations**

```typescript
seasonId = input.required<number>();
season = computed(() => this.store.seasons().find((s) => s.id === this.seasonId()));
```

#### Template Anti-Patterns

❌ **BAD - Don't use \*ngIf with async pipes**

```html
<div *ngIf="data$ | async">{{ data }}</div>
```

✅ **GOOD - Use @if with signals**

```html
@if (data()) {
<div>{{ data() }}</div>
}
```

#### State Management Anti-Patterns

❌ **DO NOT** use imperative state for reactive data:

```typescript
season: Season | null = null; // Wrong
```

✅ **DO use signals**:

```typescript
season = signal<Season | null>(null); // Correct
```

❌ **DO NOT** use `ngOnChanges` for signal inputs:

```typescript
@Input({ required: true }) seasonId!: number;
ngOnChanges() { ... } // Wrong
```

✅ **DO use computed** for reactive transformations:

```typescript
season = computed(() => { ... }); // Correct
```

❌ **DO NOT** use `*ngIf` with async pipes:

```html
<div *ngIf="data$ | async">...</div>
<!-- Old pattern -->
```

✅ **DO use `@if` with signals**:

```html
@if (data()) { ... }
<!-- Modern pattern -->
```

### When to Use Signals vs RxJS

**Use Signals when:**

- Managing component local state
- Deriving computed values from other state
- Working with template bindings and control flow
- Simple reactive dependencies without complex async patterns
- State that needs synchronous updates
- Pagination state (current page, items per page, derived page calculations)

**Use RxJS when:**

- Working with complex async operations (HTTP requests, timers, events)
- Need advanced operators (debounce, throttle, retry, combineLatest, etc.)
- Managing complex error handling and recovery
- Handling backpressure or stream buffering
- Interacting with external libraries or APIs that use Observables

**Interop Patterns:**

```typescript
// Convert Observable to Signal
data = toSignal(http.get('/api/data'), { initialValue: null });

// Convert Signal to Observable (rarely needed)
data$ = toObservable(data);

// Hybrid: Signal service returns Observable for flexibility
createItem(item: Item): Observable<Item> {
  return this.http.post<Item>('/items', item);
}
```

**Trade-offs:**

- **Signals**: Simpler syntax, better template integration, synchronous
- **RxJS**: More powerful operators, better for complex async streams, mature ecosystem

**Recommendation:** Use signals as the default for local state, use RxJS for async operations and complex stream manipulation.

## Build, Lint, and Test Commands

### Build Commands

```bash
npm run start          # Start development server (http://localhost:4200)
npm run build          # Production build
npm run watch          # Build with watch mode
```

**Important:**

- Do not start parallel builds on different ports
- Always connect to the existing development server on http://localhost:4200

### Test Commands

```bash
npm run test           # Run all tests (Vitest/jsdom mode - fast)
npm run test:coverage  # Run tests with coverage

# Run specific test files with Vitest
npm run test src/app/features/seasons/models/season.model.spec.ts
npm run test src/app/features/seasons/**/*.spec.ts  # Run all season tests

# Run browser tests (hybrid mode)
npm run test:browser      # Run component tests in Happy-DOM (real browser environment)
```

## Code Style Guidelines

### Editor Configuration (.editorconfig)

- 2 space indentation
- UTF-8 charset
- Insert final newline on save
- Trim trailing whitespace
- Single quotes for TypeScript files

### TypeScript Configuration

- Strict mode enabled: `strict: true`
- No implicit returns: `noImplicitReturns: true`
- No property access from index signature
- No fallthrough cases in switch
- Force consistent casing: `forceConsistentCasingInFileNames: true`

### Import Order

1. Angular core/common/framework imports
2. External library imports (RxJS, Taiga UI, etc.)
3. Internal application imports (services, types, components)
4. Relative imports

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { ErrorHandlingService } from '../../services/error.service';
import { IPerson } from '../../type/person.type';
```

### Component Structure

All components are standalone with this pattern:

```typescript
@Component({
  selector: 'app-feature-name', // kebab-case, app prefix
  standalone: true, // Always standalone
  imports: [
    /* dependencies */
  ], // All imports listed
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.less',
})
export class FeatureNameComponent {
  // Component logic
}
```

Facade services for state management:

```typescript
@Injectable({ providedIn: 'root' })
export class Person {
  currentPerson$: Observable<IPerson | null>;
  allPersons$: Observable<IPerson[]>;

  constructor(private store: Store<AppState>) {
    this.currentPerson$ = store.select((state) => state.person.currentPerson);
  }

  loadAllPersons() {
    this.store.dispatch(personActions.getAll());
  }
}
```

## Naming Conventions

### Files and Directories

- Components: `feature-name.component.ts`, `feature-name.component.html`, `feature-name.component.less`
- Services: `feature.service.ts`
- Types: `feature.type.ts`
- Store files: `actions.ts`, `reducers.ts`, `effects.ts`, `selectors.ts`
- All lowercase with hyphens (kebab-case)

### Code Naming

- Components: PascalCase (e.g., `PersonComponent`, `AllPersonsComponent`)
- Services: PascalCase with 'Service' suffix (e.g., `PersonService`)
- Facade services: PascalCase without suffix (e.g., `Person`)
- Interfaces: PascalCase with 'I' prefix (e.g., `IPerson`, `IMatch`)
- Observables: End with `$` suffix (e.g., `currentPerson$`, `allPersons$`)
- Methods: camelCase
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINT`, `MAX_ITEMS`)

## Type Definitions

- All types defined in `src/app/type/` directory
- Interface naming: `I` prefix (e.g., `IPerson`, `ITeam`)
- Type naming: no prefix (e.g., `AgeStats`)
- Always mark optional properties with `?` (e.g., `id?: number | null`)

```typescript
export interface IPerson {
  id?: number | null;
  first_name: string;
  second_name: string;
  person_photo_url: string | null;
}

export type PaginationState = {
  currentPage: number;
  itemsPerPage: number;
};
```

## Adding New Features

1. **Check for existing shared components** before creating new ones:
   - Review `src/app/shared/components/` for reusable UI patterns
   - Shared components include: `EntityHeader`, `Navbar`, `EmptyPage`, `Error404`
   - Example: Use `EntityHeaderComponent` for detail pages instead of duplicating header code
   - See `src/app/shared/components/README.md` for usage documentation
2. Create component directory: `src/app/components/feature-name/`
2. Create component files: `*.component.ts`, `*.html`, `*.less`
3. Create type definition: `src/app/type/feature.type.ts`
4. Create service extending `BaseApiService`: `feature.service.ts`
5. Create facade service in component directory
6. Add route to `src/app/app.routes.ts` with state injection
7. Update `src/app/store/appstate.ts` with feature state interface
8. For delete operations, use `withDeleteConfirm()` utility from `src/app/core/utils/delete-helper.util.ts` for consistent UX

## API Configuration

All API endpoints use constants from `src/app/base/constants.ts`:

```typescript
import { urlWithProtocol } from '../../base/constants';
```

Never hardcode API URLs. Use environment variables via `constants.ts`.

**Static Assets (Images, Logos, etc.)**

All static asset URLs (team logos, person photos, etc.) MUST use `buildStaticUrl()` function:

```typescript
import { buildStaticUrl } from '../../../core/config/api.constants';

// In component
teamLogoUrl(team: Team): string | null {
  return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
}
```

**Template Usage:**

```html
<!-- BAD - Direct URL binding -->
<img [src]="team.team_logo_url" [alt]="team.title" />

<!-- GOOD - Using buildStaticUrl -->
@if (teamLogoUrl(team); as logoUrl) {
  <img [src]="logoUrl" [alt]="team.title" />
} @else {
  <div class="placeholder">No logo</div>
}
```

## API Documentation

Backend API documentation is available at:

- Interactive docs: http://localhost:9000/docs
- Backend codebase: ../statsboards-backend

 Refer to these resources for:

- Available endpoints and their parameters
- Request/response schemas
- Authentication requirements
- Example requests

### PUT Endpoint Patterns

**All PUT endpoints now use path parameters (`/{item_id}/`).**

```typescript
// Teams endpoint
updateTeam(id: number, teamData: TeamUpdate): Observable<Team> {
  return this.apiService.put<Team>('/api/teams/', id, teamData, true).pipe(tap(() => this.reload()));
}

// Persons endpoint
updatePerson(id: number, personData: PersonUpdate): Observable<Person> {
  return this.apiService.put<Person>('/api/persons/', id, personData, true).pipe(tap(() => this.reload()));
}

// Tournaments endpoint (uses direct HttpClient)
updateTournament(id: number, data: TournamentUpdate): Observable<Tournament> {
  return this.http.put<Tournament>(buildApiUrl(`/api/tournaments/${id}`), data).pipe(tap(() => this.reload()));
}

// Seasons endpoint
updateSeason(id: number, seasonData: SeasonUpdate): Observable<Season> {
  return this.apiService.put<Season>('/api/seasons/', id, seasonData, true).pipe(tap(() => this.reload()));
}

// Sports endpoint
updateSport(id: number, sportData: SportUpdate): Observable<Sport> {
  return this.apiService.put<Sport>('/api/sports/', id, sportData, true).pipe(tap(() => this.reload()));
}
```

**API Endpoint Reference:**

| Resource  | PUT Endpoint Pattern          | Frontend Usage (`usePathParam`) | Backend View Reference        |
| --------- | ---------------------------- | ---------------------------- | --------------------------- |
| Teams     | `PUT /api/teams/{id}/`       | `true`                       | `src/teams/views.py:103`   |
| Persons   | `PUT /api/persons/{id}/`     | `true`                       | `src/person/views.py`        |
| Tournaments| `PUT /api/tournaments/{id}/` | Path param in URL             | `src/tournaments/views.py`    |
| Seasons   | `PUT /api/seasons/{id}/`      | `true`                       | `src/seasons/views.py:54`   |
| Sports    | `PUT /api/sports/{id}/`       | `true`                       | `src/sports/views.py:41`    |

**When Adding New PUT Endpoints:**

1. Always assume path parameters (`/{item_id}/`) pattern
2. Check backend view to verify:
   ```bash
   grep -A 5 "@router.put" ../statsboards-backend/src/<resource>/views.py
   ```

3. Use `usePathParam: true` in `apiService.put()` calls
4. Verify with backend API docs at http://localhost:9000/docs

## Console Logging

Current codebase uses console.log for debugging. When making changes:

- Keep existing console.log statements unless refactoring
- Add meaningful console.log for API calls (already in BaseApiService)
- Remove console.log before production builds if necessary

## MCP Tools for Angular Development

### Angular CLI MCP Tools

Use MCP (Model Context Protocol) tools for Angular-specific tasks:

```typescript
// List all Angular workspaces and projects
angular - cli_list_projects();

// Get Angular best practices (version-specific)
angular -
  cli_get_best_practices({
    workspacePath: '/path/to/angular.json',
  });

// Search Angular documentation
angular -
  cli_search_documentation({
    query: 'standalone components',
    includeTopContent: true,
    version: 21,
  });

// Start Angular AI Tutor for guided learning
angular - cli_ai_tutor();

// Migrate to OnPush/Zoneless
angular -
  cli_onpush_zoneless_migration({
    fileOrDirPath: '/path/to/component',
  });
```

### ESLint MCP Tool

Use ESLint MCP for linting specific files:

```typescript
eslint_lint -
  files({
    filePaths: ['/path/to/file1.ts', '/path/to/file2.ts'],
  });
```

### When to Use MCP Tools

1. **Learning and Documentation**: Use `angular-cli_search_documentation` to find current Angular API usage
2. **Project Analysis**: Use `angular-cli_list_projects` to understand workspace structure
3. **Best Practices**: Use `angular-cli_get_best_practices` before writing new features
4. **Refactoring**: Use `angular-cli_onpush_zoneless_migration` for OnPush migration planning
5. **Code Quality**: Use `eslint_lint-files` to check specific files during development
6. **Tutorials**: Use `angular-cli_ai_tutor` for guided step-by-step learning

### MCP Tool Benefits

- **Version-Specific Guidance**: Get accurate information for your Angular version (21.x)
- **Official Documentation**: Access official Angular.dev documentation
- **Best Practices**: Ensure code follows current Angular conventions
- **Automated Refactoring**: Get iterative migration plans for complex changes
- **Targeted Linting**: Check specific files without full project lint
- **Guided Learning**: Interactive tutorials for Angular concepts

## GitHub workflow (this repo)

- Default repo: <OWNER>/<REPO> (use this unless user specifies otherwise)
- Branch naming:
  - feature: feat/<linear-id>-<slug>
  - bugfix: fix/<linear-id>-<slug>
  - chore: chore/<linear-id>-<slug>
- Pull requests:
  - Always link the Linear issue (e.g. STAF-8 )
  - Include: summary, scope, testing, screenshots (frontend), migration notes (backend)
  - Ensure CI is green before requesting review
- Labels:
  - security findings → label `security`
  - refactor-only → label `refactor`
- Reviewers:
  - assign <TEAM/USERNAMES> if applicable

## Linear defaults

- Default Linear team is **StatsboardFront**.
- When creating/updating Linear issues, always use this team unless the user explicitly says otherwise.
- If a project is not specified, create the issue without assigning a project (do not guess).
- When making a plan, create:
  - 1 parent issue (epic)
  - child issues grouped by theme
- Always include: rule name(s), file paths, and a clear "Done when" checklist.

## Perplexity usage rules

- Use Perplexity MCP only for:
  - Current best practices
  - Standards, RFCs, security guidance
  - Tooling or framework updates
- Prefer local codebase and Context7 docs for implementation details.
- Summarize sources clearly when using Perplexity.

**Note**: Do not add AGENTS.md to README.md - this file is for development reference only.
**Note**: all commits must be by linroot with email nevalions@gmail.com
**Note**: When you need to search docs, use `context7` tools.
