# General Best Practices

## Always

1. Import `buildApiUrl` when testing services that use it
2. Mock all store signals that components depend on (persons, loading, search, etc.)
3. Mock all providers that components inject (ActivatedRoute, Router, Services)
4. Clear mocks between tests: `vi.clearAllMocks()`
5. Match actual implementation - read the service/component code before writing tests
6. Check URL patterns - read the service to see actual URLs
7. Provide Router using `provideRouter([])` for components that use navigation
8. Include `queryParamMap` in route mocks when components use query params
9. Check form validity before calling submit methods in validation tests
10. Use relative paths for photo upload mocks (e.g., `api/persons/photo.jpg`)
11. Provide `POLYMORPHEUS_CONTEXT` when testing Taiga UI dialog components

## Never

1. Do not test internal implementation of helper utilities (like alert helpers)
2. Do not forget queryParamMap when components use it
3. Do not mix Observable and snapshot patterns - match what the code uses
4. Do not expect services to call alerts directly when they use helper utilities
5. Do not forget to flush HTTP requests before service instantiation (if service makes requests in constructor)
6. Do not skip provideRouter in test configuration
7. Do not add `expect.any(Object)` to router.navigate() expectations unless passing navigation extras
8. Do not use `window.confirm()` for delete tests - use TuiDialogService mock
9. Do not put `id` in update data object - it is passed as a separate parameter

## Related Documentation

- [Service Tests](./service-tests.md)
- [Component Tests](./component-tests.md)
- [Navigation Tests](./navigation-tests.md)
- [HTTP/API Tests](./http-api-tests.md)
