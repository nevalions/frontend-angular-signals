# Testing Common Mistakes and Bad Practices

This document catalogs common testing mistakes found during test suite maintenance to help avoid them in the future.

## Service Tests

### ❌ Wrong: Expecting Alert Calls on Service Methods

**Problem:** Testing that services call `TuiAlertService.open()` directly.

```typescript
// WRONG
it('should call createSport with correct data', () => {
  service.createSport(sportData).subscribe();
  const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
  req.flush(mockSport);
  expect(alertServiceMock.open).toHaveBeenCalledWith('Sport created successfully', { label: 'Success' });
});
```

**Why it's wrong:** Services like `SportStoreService`, `SeasonStoreService` use the `withCreateAlert()`, `withUpdateAlert()` helper utilities which handle alerts internally. The service methods themselves don't call alerts directly.

**✅ Correct:**
```typescript
it('should call createSport with correct data', () => {
  service.createSport(sportData).subscribe();
  const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
  req.flush(mockSport);
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(sportData);
  // Don't test alerts - they're handled by helper utilities
});
```

---

## Component Tests

### ❌ Wrong: Wrong Route Mock Structure for `paramMap`

**Problem:** Using Observable-based route mock when component accesses `route.snapshot.paramMap`.

```typescript
// WRONG - Component uses route.snapshot.paramMap
routeMock = {
  paramMap: of({ get: (key: string) => (key === 'id' ? '1' : null) }),
};
```

**Why it's wrong:** Components that access `route.snapshot.paramMap` expect a snapshot structure, not an Observable.

**✅ Correct:**
```typescript
routeMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => (key === 'id' ? '1' : null),
    },
  },
} as unknown as ActivatedRoute;
```

---

### ❌ Wrong: Missing `queryParamMap` Mock

**Problem:** Component uses `route.queryParamMap.pipe()` but test doesn't provide it.

```typescript
// WRONG - Component uses toSignal on queryParamMap
routeMock = {
  paramMap: of({ get: () => '1' }),
  // Missing queryParamMap!
};
```

**✅ Correct:**
```typescript
routeMock = {
  paramMap: of({ get: () => '1' }),
  queryParamMap: of({ get: () => null }), // Add this
};
```

---

### ❌ Wrong: TestBed Reset Issues

**Problem:** Calling `TestBed.configureTestingModule()` in multiple tests without resetting.

```typescript
// WRONG - Will fail with "test module already instantiated"
it('test 1', () => {
  TestBed.configureTestingModule({ providers: [...] });
  const component = TestBed.createComponent(MyComponent);
});

it('test 2', () => {
  TestBed.configureTestingModule({ providers: [...] }); // FAILS
  const component = TestBed.createComponent(MyComponent);
});
```

**✅ Correct:**
```typescript
it('test 2', () => {
  TestBed.resetTestingModule(); // Reset first
  TestBed.configureTestingModule({ providers: [...] });
  const component = TestBed.createComponent(MyComponent);
});
```

---

### ❌ Wrong: Mocking Signals for Effects

**Problem:** Trying to mock signals that are set by effects, but effects run after component creation.

```typescript
// WRONG - Component has effect that sets selectedSeasonYear
const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
newComponent.navigateToBack();
// selectedSeasonYear is still null here because effect hasn't run yet
```

**✅ Correct:**
```typescript
const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
(newComponent as any).selectedSeasonYear.set(2024); // Set directly for test
newComponent.navigateToBack();
expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1, 2024);
```

---

### ❌ Wrong: Missing `provideRouter()` Provider

**Problem:** Components using Router fail with "No provider found for Router" or route-based navigation tests fail.

```typescript
// WRONG - Missing provideRouter
TestBed.configureTestingModule({
  providers: [
    { provide: ActivatedRoute, useValue: routeMock },
    { provide: NavigationHelperService, useValue: navHelperMock },
  ],
});
```

**Why it's wrong:** Angular needs a Router provider for components that use Router or depend on it via NavigationHelperService.

**✅ Correct:**
```typescript
import { provideRouter } from '@angular/router';

TestBed.configureTestingModule({
  providers: [
    provideRouter([]),  // Always provide router
    { provide: ActivatedRoute, useValue: routeMock },
    { provide: NavigationHelperService, useValue: navHelperMock },
  ],
});
```

---

### ❌ Wrong: Using Router Mock Instead of NavigationHelper

**Problem:** Component uses NavigationHelperService but test mocks Router directly.

```typescript
// WRONG - Component uses navigationHelper.toSportDetail(1)
beforeEach(() => {
  routerMock = { navigate: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: routerMock },
    ],
  });
});

it('should navigate to detail', () => {
  component.navigateToDetail(1);
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);  // FAILS!
});
```

**Why it's wrong:** Components use NavigationHelperService which abstracts the actual router navigation. Mocking Router directly won't work.

**✅ Correct:**
```typescript
beforeEach(() => {
  navHelperMock = { toSportDetail: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: NavigationHelperService, useValue: navHelperMock },
    ],
  });
});

it('should navigate to detail', () => {
  component.navigateToDetail(1);
  expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1);  // Works!
});
```

---

## Navigation Tests

### ❌ Wrong: Incorrect Router.navigate() Expectation

**Problem:** Expecting just the array path when queryParams are passed.

```typescript
// WRONG - toSportDetail(1) passes queryParams
it('should navigate to sport detail', () => {
  service.toSportDetail(1);
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);
});
```

**✅ Correct:**
```typescript
it('should navigate to sport detail', () => {
  service.toSportDetail(1);
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1], { queryParams: {} });
});

it('should navigate to sport detail with year', () => {
  service.toSportDetail(1, 2024);
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1], { queryParams: { year: 2024 } });
});
```

---

### ❌ Wrong: Testing Tab Changes with Wrong Expectation

**Problem:** Component's `onTabChange()` calls `router.navigate()` but test expects tab signal to change.

```typescript
// WRONG - onTabChange() navigates, doesn't change activeTab directly
it('should change tab', () => {
  component.onTabChange('teams');
  expect(component.activeTab()).toBe('teams');  // FAILS - stays as 'matches'
});
```

**Why it's wrong:** `onTabChange()` calls `router.navigate()` with query params. The `activeTab` signal comes from `toSignal(route.queryParamMap)`, which only updates when navigation happens.

**✅ Correct:**
```typescript
it('should change tab', () => {
  component.onTabChange('teams');
  expect(routerMock.navigate).toHaveBeenCalledWith(
    [],
    expect.objectContaining({
      queryParams: { tab: 'teams' },
    })
  );
});
```

---

## HTTP/API Tests

### ❌ Wrong: Wrong URL Pattern for CRUD Operations

**Problem:** Expecting `/api/resource/id/1` for update/delete when service uses different pattern.

```typescript
// WRONG - Check what URL the service actually uses
it('should call updatePosition', () => {
  service.updatePosition(1, data).subscribe();
  const req = httpMock.expectOne('/api/positions/1'); // Wrong URL!
});
```

**✅ Correct:**
```typescript
// Check the actual service implementation
// PositionStoreService.updatePosition uses apiService.put() with usePathParam: true
// This generates URL: /api/positions/1/ (with trailing slash)
it('should call updatePosition', () => {
  service.updatePosition(1, data).subscribe();
  const req = httpMock.expectOne('/api/positions/1/');
});
```

**Key Patterns:**
- **POST:** `/api/resource/` (uses `ApiService.post()`)
- **PUT with usePathParam:** `/api/resource/1/` (uses `ApiService.put()`)
- **PUT without usePathParam:** `/api/resource?item_id=1` (uses `ApiService.put()`)
- **DELETE:** `/api/resource/id/1` (uses `ApiService.delete()`)

---

## Test Organization

### ❌ Wrong: Service Dependency Injection Order

**Problem:** Injecting `httpMock` after injecting service that uses it in constructor.

```typescript
// WRONG - service constructor uses http immediately
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [...] });
  service = TestBed.inject(TeamStoreService); // Constructor tries to use http immediately
  httpMock = TestBed.inject(HttpTestingController); // Too late!
});
```

**✅ Correct:**
```typescript
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [...] });
  httpMock = TestBed.inject(HttpTestingController); // Inject first
  // Mock any requests that happen during service creation
  const req = httpMock.expectOne(buildApiUrl('/api/teams/'));
  service = TestBed.inject(TeamStoreService);
  req.flush([]); // Flush to prevent hanging requests
});
```

---

## General Best Practices

### ✅ Always

1. **Import `buildApiUrl`** when testing services that use it
2. **Mock all providers** that components inject (ActivatedRoute, Router, Services)
3. **Clear mocks** between tests: `vi.clearAllMocks()`
4. **Match the actual implementation** - read the service/component code before writing tests
5. **Check URL patterns** - use console.log or read the service to see actual URLs

### ❌ Never

1. **Don't test internal implementation** of helper utilities (like alert helpers)
2. **Don't forget queryParamMap** when components use it
3. **Don't mix Observable and snapshot patterns** - match what the code actually uses
4. **Don't expect services to call alerts directly** when they use helper utilities
5. **Don't forget to flush HTTP requests** before service instantiation (if service makes requests in constructor)

---

### ❌ Wrong: Expecting 0 When toSignal Returns null

**Problem:** Route param is null but test expects `toSignal(Number(param))` to return 0.

```typescript
// WRONG - Number(null) returns 0, but toSignal with null returns null
it('should return null when tournamentId is null', () => {
  routeMock = { paramMap: of({ get: () => null }) };
  expect(newComponent.tournamentId()).toBe(0);  // FAILS - it's null
});
```

**Why it's wrong:** While `Number(null)` returns 0, `toSignal()` with `initialValue: null` will return null when the Observable emits null. The component explicitly returns null when params are missing:

```typescript
tournamentId = toSignal(
  this.route.paramMap.pipe(map((params) => {
    const val = params.get('id');
    return val ? Number(val) : null;  // Explicit null check
  })),
  { initialValue: null }
);
```

**✅ Correct:**
```typescript
it('should return null when tournamentId is null', () => {
  routeMock = { paramMap: of({ get: () => null }) };
  expect(newComponent.tournamentId()).toBe(null);
});
```

---

## Common Error Messages

### "Unable to lift unknown Observable type"
**Cause:** Passing a mock Observable to `toSignal()` that doesn't match RxJS Observable implementation.

**Solution:** Check that you're using real Observables from 'rxjs', not custom mocks.

### "Cannot read properties of undefined (reading 'pipe')"
**Cause:** Missing `queryParamMap` in route mock when component uses it.

**Solution:** Add `queryParamMap: of({ get: () => null })` to your route mock.

### "Cannot configure test module when test module has already been instantiated"
**Cause:** Calling `TestBed.configureTestingModule()` multiple times without `TestBed.resetTestingModule()`.

**Solution:** Call `TestBed.resetTestingModule()` before `TestBed.configureTestingModule()` in subsequent tests.

### "Expected one matching request for criteria, found none"
**Cause:** URL pattern in `httpMock.expectOne()` doesn't match actual request URL.

**Solution:** Check service implementation for exact URL pattern (trailing slashes, `/id/` vs query params, etc.).
