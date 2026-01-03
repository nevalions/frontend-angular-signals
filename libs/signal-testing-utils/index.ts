import { TestBed } from '@angular/core/testing';
import { signal, Signal, WritableSignal } from '@angular/core';

/**
 * Creates a mock writable signal with basic signal API
 */
export function createMockSignal<T>(initialValue: T): WritableSignal<T> {
  const sig = signal(initialValue);
  return sig;
}

/**
 * Creates a mock computed signal that can return values
 */
export function createMockComputed<T>(initialValue: T): Signal<T> {
  const sig = signal(initialValue);
  return sig.asReadonly();
}

/**
 * Helper to test effect execution
 */
export function flushEffects(): void {
  TestBed.flushEffects();
}

/**
 * Creates a mock for httpResource responses
 */
export function createMockHttpResource<T>() {
  const value = signal<T | null>(null);
  const isLoading = signal(false);
  const error = signal<Error | null>(null);

  return {
    value: value.asReadonly(),
    isLoading: isLoading.asReadonly(),
    error: error.asReadonly(),
    reload: () => {},
  };
}
