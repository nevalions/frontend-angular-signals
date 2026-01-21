import { HttpParams } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { SortOrder } from '../models';

export interface PaginationStateOptions {
  page?: number;
  itemsPerPage?: number;
  sortOrder?: SortOrder;
  search?: string;
}

export interface PaginationState {
  page: WritableSignal<number>;
  itemsPerPage: WritableSignal<number>;
  sortOrder: WritableSignal<SortOrder>;
  search: WritableSignal<string>;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setSearch: (search: string) => void;
}

export interface PaginationParamsInput {
  page: number;
  itemsPerPage: number;
  sortOrder: SortOrder;
  search?: string;
}

export function createPaginationState(options: PaginationStateOptions = {}): PaginationState {
  const page = signal(options.page ?? 1);
  const itemsPerPage = signal(options.itemsPerPage ?? 10);
  const sortOrder = signal<SortOrder>(options.sortOrder ?? 'asc');
  const search = signal(options.search ?? '');

  const setPage = (value: number): void => {
    page.set(value);
  };

  const setItemsPerPage = (value: number): void => {
    itemsPerPage.set(value);
    page.set(1);
  };

  const setSortOrder = (value: SortOrder): void => {
    sortOrder.set(value);
    page.set(1);
  };

  const setSearch = (value: string): void => {
    search.set(value);
    page.set(1);
  };

  return {
    page,
    itemsPerPage,
    sortOrder,
    search,
    setPage,
    setItemsPerPage,
    setSortOrder,
    setSearch,
  };
}

export function buildPaginationParams(params: PaginationParamsInput): HttpParams {
  let httpParams = new HttpParams()
    .set('page', params.page.toString())
    .set('items_per_page', params.itemsPerPage.toString())
    .set('ascending', (params.sortOrder === 'asc').toString());

  if (params.search) {
    httpParams = httpParams.set('search', params.search);
  }

  return httpParams;
}
