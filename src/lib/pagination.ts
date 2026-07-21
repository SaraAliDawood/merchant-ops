export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

/** Parse & clamp page/pageSize query params into safe skip/take values. */
export function parsePageParams(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const rawSize = Number(params.get('pageSize')) || DEFAULT_SIZE;
  const pageSize = Math.min(MAX_SIZE, Math.max(1, rawSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number): Page<T> {
  return {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
