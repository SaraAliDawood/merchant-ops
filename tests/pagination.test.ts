import { describe, it, expect } from 'vitest';
import { parsePageParams, paginated } from '@/lib/pagination';

describe('parsePageParams', () => {
  it('defaults to page 1, size 20', () => {
    const p = parsePageParams(new URLSearchParams());
    expect(p).toMatchObject({ page: 1, pageSize: 20, skip: 0, take: 20 });
  });

  it('computes skip from page & size', () => {
    const p = parsePageParams(new URLSearchParams({ page: '3', pageSize: '10' }));
    expect(p).toMatchObject({ page: 3, pageSize: 10, skip: 20, take: 10 });
  });

  it('clamps out-of-range values', () => {
    expect(parsePageParams(new URLSearchParams({ page: '-5' })).page).toBe(1);
    expect(parsePageParams(new URLSearchParams({ pageSize: '9999' })).pageSize).toBe(100);
  });
});

describe('paginated', () => {
  it('reports total pages', () => {
    expect(paginated([], 45, 1, 20).totalPages).toBe(3);
    expect(paginated([], 0, 1, 20).totalPages).toBe(1);
  });
});
