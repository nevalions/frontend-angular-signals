# Component Tests

## Wrong: Missing Store Signals in Mock

Problem: Mocking store service but missing computed signals that components depend on.

```typescript
// Wrong - component uses loading() signal
storeMock = {
  persons: vi.fn().mockReturnValue([]),
  updatePerson: vi.fn().mockReturnValue(of(undefined)),
  // Missing loading
};
```

Why it's wrong: components with `loading = this.store.loading` will fail with "loading is not a function".

Correct:

```typescript
storeMock = {
  persons: vi.fn().mockReturnValue([]),
  loading: vi.fn().mockReturnValue(false),
  search: vi.fn().mockReturnValue(''),
  updatePerson: vi.fn().mockReturnValue(of(undefined)),
};
```

## Wrong: Wrong Route Mock Structure for paramMap

Problem: Using Observable-based route mock when component accesses `route.snapshot.paramMap`.

```typescript
// Wrong - component uses route.snapshot.paramMap
routeMock = {
  paramMap: of({ get: (key: string) => (key === 'id' ? '1' : null) }),
};
```

Correct:

```typescript
routeMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => (key === 'id' ? '1' : null),
    },
  },
} as unknown as ActivatedRoute;
```

## Wrong: Missing queryParamMap Mock

Problem: Component uses `route.queryParamMap.pipe()` but test does not provide it.

```typescript
// Wrong - component uses toSignal on queryParamMap
routeMock = {
  paramMap: of({ get: () => '1' }),
  // Missing queryParamMap
};
```

Correct:

```typescript
routeMock = {
  paramMap: of({ get: () => '1' }),
  queryParamMap: of({ get: () => null }),
};
```

## Wrong: Mocking Signals for Effects

Problem: Trying to mock signals that are set by effects, but effects run after component creation.

```typescript
// Wrong - component has effect that sets selectedSeasonYear
const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
newComponent.navigateToBack();
// selectedSeasonYear is still null here because effect has not run yet
```

Correct:

```typescript
const newComponent = TestBed.createComponent(TournamentListComponent).componentInstance;
(newComponent as any).selectedSeasonYear.set(2024); // Set directly for test
newComponent.navigateToBack();
expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1, 2024);
```

## Wrong: Not Checking Form Validity Before Submit

Problem: Calling `onSubmit()` without verifying form is invalid.

```typescript
// Wrong - form might be valid or invalid, not verified
it('should not update when form is invalid', () => {
  component.seasonForm.setValue({ year: '', description: '' });
  component.onSubmit();
  expect(storeMock.updateSeason).not.toHaveBeenCalled();
});
```

Correct:

```typescript
it('should not update when form is invalid', () => {
  component.seasonForm.setValue({ year: '1800', description: '' });
  expect(component.seasonForm.valid).toBe(false);
  component.onSubmit();
  expect(storeMock.updateSeason).not.toHaveBeenCalled();
});
```

## Wrong: Missing provideRouter() Provider

Problem: Components using Router fail with "No provider found for Router" or route-based navigation tests fail.

```typescript
// Wrong - missing provideRouter
TestBed.configureTestingModule({
  providers: [
    { provide: ActivatedRoute, useValue: routeMock },
    { provide: NavigationHelperService, useValue: navHelperMock },
  ],
});
```

Correct:

```typescript
import { provideRouter } from '@angular/router';

TestBed.configureTestingModule({
  providers: [
    provideRouter([]),
    { provide: ActivatedRoute, useValue: routeMock },
    { provide: NavigationHelperService, useValue: navHelperMock },
  ],
});
```

## Wrong: Missing POLYMORPHEUS_CONTEXT for Taiga UI Dialogs

Problem: Testing Taiga UI dialog components fails with "No provider found for InjectionToken".

```typescript
// Wrong - missing POLYMORPHEUS_CONTEXT
TestBed.configureTestingModule({
  providers: [
    { provide: AuthService, useValue: authServiceMock },
    { provide: TuiAlertService, useValue: alertsMock },
  ],
});
```

Correct:

```typescript
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

contextMock = {
  completeWith: vi.fn(),
};

TestBed.configureTestingModule({
  providers: [
    { provide: AuthService, useValue: authServiceMock },
    { provide: TuiAlertService, useValue: alertsMock },
    { provide: TuiDialogService, useValue: dialogsMock },
    { provide: POLYMORPHEUS_CONTEXT, useValue: contextMock },
  ],
});
```

## Wrong: Using window.confirm() for Delete Confirmation

Problem: Testing delete operations with `window.confirm` mock.

```typescript
// Wrong - components use withDeleteConfirm() which uses TuiDialogService
it('should delete on confirmation', () => {
  window.confirm = vi.fn(() => true);
  component.deleteSeason();
  expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
});
```

Correct:

```typescript
it('should delete on confirmation', () => {
  component.deleteSeason();
  expect(dialogsMock.open).toHaveBeenCalled();
  expect(storeMock.deleteSeason).toHaveBeenCalledWith(1);
});

it('should not delete when cancelled', () => {
  dialogsMock.open.mockReturnValueOnce(of(false));
  component.deleteSeason();
  expect(dialogsMock.open).toHaveBeenCalled();
  expect(storeMock.deleteSeason).not.toHaveBeenCalled();
});
```

## Wrong: Using Router Mock Instead of NavigationHelper

Problem: Component uses NavigationHelperService but test mocks Router directly.

```typescript
// Wrong - component uses navigationHelper.toSportDetail(1)
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
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);
});
```

Correct:

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
  expect(navHelperMock.toSportDetail).toHaveBeenCalledWith(1);
});
```

## Wrong: Expecting 0 When toSignal Returns null

Problem: Route param is null but test expects `toSignal(Number(param))` to return 0.

```typescript
// Wrong - Number(null) returns 0, but toSignal with null returns null
it('should return null when tournamentId is null', () => {
  routeMock = { paramMap: of({ get: () => null }) };
  expect(newComponent.tournamentId()).toBe(0);
});
```

Why it's wrong: `createNumberParamSignal()` handles null values and returns null.

```typescript
tournamentId = createNumberParamSignal(this.route, 'id');
```

Correct:

```typescript
it('should return null when tournamentId is null', () => {
  routeMock = { paramMap: of({ get: () => null }) };
  expect(newComponent.tournamentId()).toBe(null);
});
```

## Related Documentation

- [Navigation Tests](./navigation-tests.md)
- [HTTP/API Tests](./http-api-tests.md)
- [General Best Practices](./best-practices.md)
