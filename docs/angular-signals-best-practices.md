# Angular Signals Best Practices

This document covers all signal-based development patterns and requirements for this Angular 21.x project.

## Important Notes

- All components must be standalone (no NgModules)
- Signal-based Angular project
- All components must use `ChangeDetectionStrategy.OnPush`
- Prefer signals over imperative state for all reactive patterns
- Paginated lists MUST follow the canonical Paginated List Pattern (see [Service Patterns](./service-patterns.md))

## Component Requirements

### 1. Change Detection Strategy

All components MUST use `ChangeDetectionStrategy.OnPush`:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // REQUIRED for all components
})
```

### 2. Signals for State

- Use `signal()` for local writable state
- Use `computed()` for derived state
- Use `toSignal()` to convert Observables to signals
- Avoid imperative state variables that should be signals

### 3. Reactive Route Params

```typescript
// GOOD - Use helper functions for route params
import { createNumberParamSignal, createStringParamSignal, createBooleanParamSignal } from '../../core/utils/route-param-helper.util';

// Number param from URL path
seasonId = createNumberParamSignal(this.route, 'id');

// String param with default value
activeTab = createStringParamSignal(this.route, 'tab', {
  source: 'queryParamMap',
  defaultValue: 'defaultTab',
});

// Boolean param
fromSport = createBooleanParamSignal(this.route, 'fromSport', {
  source: 'queryParamMap',
});

// BAD - Manual param parsing
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

### 4. Computed Signals for Lookup

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

### 5. Effect() Usage

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

### 6. Signal Inputs/Outputs

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

### 7. Reactive Forms (Traditional)

Use traditional Reactive Forms with validation:

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

### 8. linkedSignal() for Advanced Derived State

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

### 9. Experimental Features

**⚠️ IMPORTANT: `signals: true` is NOT AVAILABLE in Angular 21.x**

The experimental `signals: true` component decorator option does not exist in Angular 21.0.6.

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

### 10. Tab Navigation with Query Parameters

**Canonical Pattern for Tab State Management:**

Tab state MUST be managed via URL query parameters to enable:
- Deep linking to specific tabs
- Browser history navigation (back/forward)
- State persistence across page refreshes
- Shareable URLs with pre-selected tabs

```typescript
// ✅ GOOD - Query parameter-based tab state
import { ActivatedRoute, Router } from '@angular/router';
import { createStringParamSignal } from '../../core/utils/route-param-helper.util';

export class DetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Reactive tab state from query params
  activeTab = createStringParamSignal(this.route, 'tab', {
    source: 'queryParamMap',
    defaultValue: 'defaultTab',
  });

  // Tab change handler updates URL
  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
```

**Template Usage:**

```html
<nav class="detail__tabs">
  <button
    class="detail__tab"
    [class.detail__tab--active]="activeTab() === 'tab1'"
    (click)="onTabChange('tab1')"
  >
    Tab 1
  </button>
  <button
    class="detail__tab"
    [class.detail__tab--active]="activeTab() === 'tab2'"
    (click)="onTabChange('tab2')"
  >
    Tab 2
  </button>
</nav>

@if (activeTab() === 'tab1') {
  <app-tab1-content [inputs]="..." />
} @else if (activeTab() === 'tab2') {
  <app-tab2-content [inputs]="..." />
}
```

**Anti-Patterns:**

```typescript
// ❌ BAD - Imperative tab state (no deep linking, no history)
activeTab = 'matches';

onTabChange(tab: string): void {
  this.activeTab = tab;
}

// ❌ BAD - Local signal without URL sync
activeTab = signal('matches');

onTabChange(tab: string): void {
  this.activeTab.set(tab);
}
```

**Benefits of Query Parameter Tabs:**

- ✅ Deep linking: User can share URL like `/tournaments/123?tab=teams`
- ✅ Browser history: Back/forward works between tabs
- ✅ Refresh persistence: Selected tab survives page reload
- ✅ Child navigation: Can navigate back to parent with specific tab
- ✅ URL shareability: Easy to share with pre-selected tab

**Examples in Codebase:**

- `SportDetailComponent` - Tabs: tournaments, teams, players, positions
- `TournamentDetailComponent` - Tabs: matches, teams, players

## Related Documentation

- [Component Patterns](./component-patterns.md) - Component structure and patterns
- [Service Patterns](./service-patterns.md) - Signal-based service patterns
- [Common Anti-Patterns](./common-anti-patterns.md) - What to avoid
- [Signals vs RxJS](./signals-vs-rxjs.md) - When to use each
