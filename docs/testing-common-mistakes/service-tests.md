# Service Tests

## Wrong: Expecting Alert Calls on Service Methods

Problem: Testing that services call `TuiAlertService.open()` directly.

```typescript
// Wrong
it('should call createSport with correct data', () => {
  service.createSport(sportData).subscribe();
  const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
  req.flush(mockSport);
  expect(alertServiceMock.open).toHaveBeenCalledWith('Sport created successfully', { label: 'Success' });
});
```

Why it's wrong: services like `SportStoreService`, `SeasonStoreService` use the `withCreateAlert()`, `withUpdateAlert()` helpers which handle alerts internally. The service methods do not call alerts directly.

Correct:

```typescript
it('should call createSport with correct data', () => {
  service.createSport(sportData).subscribe();
  const req = httpMock.expectOne(buildApiUrl('/api/sports/'));
  req.flush(mockSport);
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(sportData);
  // Do not test alerts - handled by helper utilities
});
```

## Related Documentation

- [HTTP/API Tests](./http-api-tests.md)
- [General Best Practices](./best-practices.md)
