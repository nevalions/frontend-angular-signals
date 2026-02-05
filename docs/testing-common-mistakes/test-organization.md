# Test Organization

## Wrong: TestBed Reset Issues

Problem: Calling `TestBed.configureTestingModule()` in multiple tests without resetting.

```typescript
// Wrong - will fail with "test module already instantiated"
it('test 1', () => {
  TestBed.configureTestingModule({ providers: [...] });
  const component = TestBed.createComponent(MyComponent);
});

it('test 2', () => {
  TestBed.configureTestingModule({ providers: [...] });
  const component = TestBed.createComponent(MyComponent);
});
```

Correct:

```typescript
it('test 2', () => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [...] });
  const component = TestBed.createComponent(MyComponent);
});
```

## Wrong: Service Dependency Injection Order

Problem: Injecting `httpMock` after injecting service that uses it in constructor.

```typescript
// Wrong - service constructor uses http immediately
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [...] });
  service = TestBed.inject(TeamStoreService);
  httpMock = TestBed.inject(HttpTestingController);
});
```

Correct:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [...] });
  httpMock = TestBed.inject(HttpTestingController);
  const req = httpMock.expectOne(buildApiUrl('/api/teams/'));
  service = TestBed.inject(TeamStoreService);
  req.flush([]);
});
```

## Related Documentation

- [Service Tests](./service-tests.md)
- [General Best Practices](./best-practices.md)
