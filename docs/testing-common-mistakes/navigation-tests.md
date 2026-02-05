# Navigation Tests

## Wrong: Incorrect Router.navigate() Expectation

Problem: Expecting just the array path when queryParams are passed.

```typescript
// Wrong - toSportDetail(1) passes queryParams
it('should navigate to sport detail', () => {
  service.toSportDetail(1);
  expect(routerMock.navigate).toHaveBeenCalledWith(['/sports', 1]);
});
```

Correct:

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

## Wrong: Adding expect.any(Object) to Router.navigate() Expectation

Problem: Adding `expect.any(Object)` when Router does not pass additional parameters.

```typescript
// Wrong - router.navigate() does not pass extra object by default
it('should navigate back', () => {
  component.navigateBack();
  expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons'], expect.any(Object));
});
```

Correct:

```typescript
it('should navigate back', () => {
  component.navigateBack();
  expect(routerMock.navigate).toHaveBeenCalledWith(['/seasons']);
});
```

## Wrong: Testing Tab Changes with Wrong Expectation

Problem: Component's `onTabChange()` calls `router.navigate()` but test expects tab signal to change.

```typescript
// Wrong - onTabChange() navigates, does not change activeTab directly
it('should change tab', () => {
  component.onTabChange('teams');
  expect(component.activeTab()).toBe('teams');
});
```

Correct:

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

## Related Documentation

- [Component Tests](./component-tests.md)
- [General Best Practices](./best-practices.md)
