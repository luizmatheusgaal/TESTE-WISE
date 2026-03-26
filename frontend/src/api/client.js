const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: 'Não foi possível concluir a operação.' }));

    const error = new Error(errorBody.message ?? 'Não foi possível concluir a operação.');
    error.details = errorBody.details ?? [];
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  getProducts: async ({ category } = {}) => {
    const query = new URLSearchParams();
    if (category) {
      query.set('category', category);
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${suffix}`);
  },

  getCart: () => request('/cart'),

  addCartItem: (payload) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateCartItem: (itemId, payload) =>
    request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  removeCartItem: (itemId) =>
    request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    }),

  applyCoupon: (payload) =>
    request('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
