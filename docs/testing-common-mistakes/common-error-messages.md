# Common Error Messages

## "Unable to lift unknown Observable type"

Cause: Passing a mock Observable to `toSignal()` that does not match RxJS Observable implementation.

Solution: Use real Observables from `rxjs`, not custom mocks.

## "Cannot read properties of undefined (reading 'pipe')"

Cause: Missing `queryParamMap` in route mock when component uses it.

Solution: Add `queryParamMap: of({ get: () => null })` to your route mock.

## "Cannot configure test module when test module has already been instantiated"

Cause: Calling `TestBed.configureTestingModule()` multiple times without `TestBed.resetTestingModule()`.

Solution: Call `TestBed.resetTestingModule()` before `TestBed.configureTestingModule()` in subsequent tests.

## "Expected one matching request for criteria, found none"

Cause: URL pattern in `httpMock.expectOne()` does not match actual request URL.

Solution: Check service implementation for exact URL pattern (trailing slashes, `/id/` vs query params, etc.).

## Related Documentation

- [HTTP/API Tests](./http-api-tests.md)
- [Test Organization](./test-organization.md)
