import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../../api/client';

describe('api client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds products URL with category query', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    await api.getProducts({ category: 'roupas' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/products?category=roupas',
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('throws API error message with details', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Estoque insuficiente.',
        details: [{ field: 'quantity', message: 'Sem estoque.' }]
      })
    });

    await expect(api.addCartItem({ product_id: 1, quantity: 99 })).rejects.toMatchObject({
      message: 'Estoque insuficiente.',
      status: 409,
      details: [{ field: 'quantity', message: 'Sem estoque.' }]
    });
  });
});