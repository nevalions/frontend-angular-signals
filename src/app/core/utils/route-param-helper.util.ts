import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable } from 'rxjs';

type ParamMapSource = Observable<ParamMap>;

export interface NumberParamSignalOptions {
  source?: 'paramMap' | 'queryParamMap';
  defaultValue?: number | null;
  initialValue?: number | null;
}

export interface StringParamSignalOptions {
  source?: 'paramMap' | 'queryParamMap';
  defaultValue?: string | null;
  initialValue?: string | null;
}

export interface BooleanParamSignalOptions {
  source?: 'paramMap' | 'queryParamMap';
  defaultValue?: boolean;
  initialValue?: boolean;
}

const parseNumberParam = (value: string | null, defaultValue: number | null): number | null => {
  if (value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const parseStringParam = (value: string | null, defaultValue: string | null): string | null => {
  if (value === null || value === '') {
    return defaultValue;
  }
  return value;
};

const parseBooleanParam = (value: string | null, defaultValue: boolean): boolean => {
  if (value === null || value === '') {
    return defaultValue;
  }
  return value === 'true';
};

export function createNumberParamSignal(
  route: ActivatedRoute,
  key: string,
  options: NumberParamSignalOptions = {}
): Signal<number | null> {
  const source: ParamMapSource = options.source === 'queryParamMap' ? route.queryParamMap : route.paramMap;
  const defaultValue = options.defaultValue ?? null;
  const initialValue = options.initialValue ?? defaultValue;

  return toSignal(
    source.pipe(map((params) => parseNumberParam(params.get(key), defaultValue))),
    { initialValue }
  );
}

export function createStringParamSignal(
  route: ActivatedRoute,
  key: string,
  options: StringParamSignalOptions = {}
): Signal<string | null> {
  const source: ParamMapSource = options.source === 'queryParamMap' ? route.queryParamMap : route.paramMap;
  const defaultValue = options.defaultValue ?? null;
  const initialValue = options.initialValue ?? defaultValue;

  return toSignal(
    source.pipe(map((params) => parseStringParam(params.get(key), defaultValue))),
    { initialValue }
  );
}

export function createBooleanParamSignal(
  route: ActivatedRoute,
  key: string,
  options: BooleanParamSignalOptions = {}
): Signal<boolean> {
  const source: ParamMapSource = options.source === 'queryParamMap' ? route.queryParamMap : route.paramMap;
  const defaultValue = options.defaultValue ?? false;
  const initialValue = options.initialValue ?? defaultValue;

  return toSignal(
    source.pipe(map((params) => parseBooleanParam(params.get(key), defaultValue))),
    { initialValue }
  );
}
