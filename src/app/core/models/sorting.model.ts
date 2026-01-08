import { PaginationParams } from './pagination.model';

export type SortOrder = 'asc' | 'desc';

export interface SortParams<TSortBy extends string = string> {
  sort_by: TSortBy;
  sort_order: SortOrder;
}

export interface PaginationAndSortParams<TSortBy extends string = string> extends PaginationParams {
  sort_by?: TSortBy;
  sort_order?: SortOrder;
}
