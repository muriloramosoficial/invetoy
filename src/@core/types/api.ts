// ─── Core API Types ───
// Tipos genéricos reutilizáveis em toda a aplicação

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationParams {
  page: number;
  pageSize: number;
}
