# HTTP/API Tests

## Wrong: Using Full URLs in Photo Upload Mocks

Problem: Mocking photo upload with full URLs instead of relative paths.

```typescript
// Wrong - uploadPersonPhoto returns full URL
uploadPersonPhoto: vi.fn().mockReturnValue(of({ webview: 'http://test.com/photo.jpg' })),
```

Why it's wrong: components use `buildStaticUrl()` which prepends `API_BASE_URL`. Expecting full URLs causes assertion failures.

Correct:

```typescript
// Returns relative path that buildStaticUrl will combine with API_BASE_URL
uploadPersonPhoto: vi.fn().mockReturnValue(of({ webview: 'api/persons/photo.jpg' })),

// Test expectation:
expect(component.photoPreviewUrl()).toBe('http://localhost:9000/api/persons/photo.jpg');
```

## Wrong: Service Method Signature for Update Operations

Problem: Expecting `id` as part of data object when it is a separate parameter.

```typescript
// Wrong - updatePerson does not take id in data object
it('should call updatePerson', () => {
  component.onSubmit();
  expect(storeMock.updatePerson).toHaveBeenCalledWith({
    first_name: 'John',
    id: 1,
  });
});
```

Correct:

```typescript
it('should call updatePerson', () => {
  component.onSubmit();
  expect(storeMock.updatePerson).toHaveBeenCalledWith(
    1,
    {
      first_name: 'John',
      second_name: 'Doe',
    }
  );
});
```

## Wrong: Wrong URL Pattern for CRUD Operations

Problem: Expecting `/api/resource/id/1` for update/delete when service uses a different pattern.

```typescript
// Wrong - check what URL the service actually uses
it('should call updatePosition', () => {
  service.updatePosition(1, data).subscribe();
  const req = httpMock.expectOne('/api/positions/1');
});
```

Correct:

```typescript
// PositionStoreService.updatePosition uses apiService.put() with usePathParam: true
// This generates URL: /api/positions/1/ (with trailing slash)
it('should call updatePosition', () => {
  service.updatePosition(1, data).subscribe();
  const req = httpMock.expectOne('/api/positions/1/');
});
```

Key patterns:

- POST: `/api/resource/` (uses `ApiService.post()`)
- PUT with usePathParam: `/api/resource/1/` (uses `ApiService.put()`)
- PUT without usePathParam: `/api/resource?item_id=1` (uses `ApiService.put()`)
- DELETE: `/api/resource/id/1` (uses `ApiService.delete()`)

## Related Documentation

- [Service Tests](./service-tests.md)
- [General Best Practices](./best-practices.md)
