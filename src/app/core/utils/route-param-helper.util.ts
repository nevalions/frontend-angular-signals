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

const parseNumberParam = (value: string | null, defaultValue: number | null): number | null => {
  if (value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
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
