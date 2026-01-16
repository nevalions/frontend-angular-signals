# Testing Patterns

This document covers testing patterns for components, services, and models.

**Important:** See [Testing Common Mistakes](./testing-common-mistakes.md) for a catalog of common testing errors to avoid.

## Component Testing Patterns

### Test Setup

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

### Form Validation Tests

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

### Signal-Based State Tests

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

### Navigation After Operations

```typescript
it('should navigate to list after successful creation', () => {
  component.seasonForm.setValue({ year: 2024, description: 'Test' });
  component.onSubmit();
  expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
});
```

### Delete Confirmation Tests

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

### Null/Not-Found Handling

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

## Service Testing Patterns

### CRUD Operation Tests

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

### Signal Property Validation

```typescript
it('should have seasons signal', () => {
  expect(service.seasons).toBeDefined();
  expect(typeof service.seasons === 'function').toBe(true);
});

it('should have seasonsResource', () => {
  expect(service.seasonsResource).toBeDefined();
});
```

### Reload Method Tests

```typescript
it('should have reload method', () => {
  expect(service.reload).toBeDefined();
  expect(typeof service.reload === 'function').toBe(true);
});

it('should trigger reload of seasonsResource', () => {
  const reloadSpy = vi.spyOn(service.seasonsResource, 'reload');
  service.reload();
  expect(reloadSpy).toHaveBeenCalled();
});
```

## Model Testing Patterns

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

## Route Mocking Patterns

### Simple Route Parameter Mocking

```typescript
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({ get: (_key: string) => '1' }),
        },
      },
    ],
  });
});
```

### Multiple Route Parameters

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({
            get: (key: string) => {
              switch (key) {
                case 'sportId': return '1';
                case 'year': return '2024';
                case 'id': return '1';
                default: return null;
              }
            }
          }),
        },
      },
    ],
  });
});
```

### Query Parameter Mocking

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of({ get: (_key: string) => '1' }),
          queryParamMap: of({ get: (key: string) => {
            if (key === 'tab') return 'matches';
            if (key === 'year') return '2024';
            return null;
          }}),
        },
      },
    ],
  });
});
```

### Effect Detection for Route Changes

When components use `effect()` to initialize signals based on route parameters, call `fixture.detectChanges()`:

```typescript
it('should get season by year from store', () => {
  TestBed.resetTestingModule();
  const routeMock = {
    paramMap: of({ get: (key: string) => (key === 'year' ? '2024' : null) }),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: ActivatedRoute, useValue: routeMock },
      { provide: SeasonStoreService, useValue: seasonStoreMock },
    ],
  });
  const fixture = TestBed.createComponent(MyComponent);
  fixture.detectChanges();  // Required for effects to run
  expect(fixture.componentInstance.season()).toEqual(mockSeasons[0]);
});
```

### Required Providers for Components

Most components need these providers in their tests:

```typescript
TestBed.configureTestingModule({
  providers: [
    provideRouter([]),  // Always provide router
    { provide: ActivatedRoute, useValue: routeMock },
    { provide: NavigationHelperService, useValue: navHelperMock },
    { provide: YourStoreService, useValue: storeMock },
    { provide: TuiAlertService, useValue: alertsMock },
    { provide: TuiDialogService, useValue: dialogsMock },
  ],
});
```

## Signal Testing Utilities

```typescript
import { createMockSignal, createMockComputed } from '@your-org/signal-testing-utils';

const mockSeasons = createMockSignal([]);
const mockLoading = createMockComputed(false);
```

### Avoid Mocking Signal Methods

- Use real signals in tests when possible
- Only mock services, not signal implementations
- Test reactivity through actual signal updates

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage
- [Component Patterns](./component-patterns.md) - Component structure
- [Service Patterns](./service-patterns.md) - Service patterns
