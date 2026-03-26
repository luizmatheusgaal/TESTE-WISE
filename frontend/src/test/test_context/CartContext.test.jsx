import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartPage } from '../../pages/CartPage';
import { CartProvider } from '../../context/CartContext';

vi.mock('../../api/client', () => ({
  api: {
    getCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    applyCoupon: vi.fn(),
    addCartItem: vi.fn()
  }
}));

import { api } from '../../api/client';

const cartResponse = {
  items: [
    {
      id: 1,
      product_id: 1,
      name: 'Camiseta',
      quantity: 2,
      stock: 5,
      unit_price: 49.9,
      subtotal: 99.8
    }
  ],
  subtotal_amount: 99.8,
  discount: 0,
  total: 99.8,
  coupon: null
};

describe('Cart flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCart.mockResolvedValue(cartResponse);

    api.updateCartItem.mockResolvedValue({
      ...cartResponse,
      items: [{ ...cartResponse.items[0], quantity: 3, subtotal: 149.7 }],
      subtotal_amount: 149.7,
      total: 149.7
    });

    api.removeCartItem.mockResolvedValue({
      items: [],
      subtotal_amount: 0,
      discount: 0,
      total: 0,
      coupon: null
    });

    api.applyCoupon.mockResolvedValue({
      ...cartResponse,
      discount: 15,
      total: 84.8,
      coupon: { code: 'VALE15' }
    });
  });

  it('updates quantity and applies coupon', async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );

    await screen.findByText('Camiseta');
    fireEvent.click(screen.getByText('+'));

    await waitFor(() => expect(api.updateCartItem).toHaveBeenCalledWith(1, { quantity: 3 }));
    expect(screen.queryByRole('status')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cupom de desconto'), {
      target: { value: 'VALE15' }
    });
    fireEvent.click(screen.getByText('Aplicar cupom'));

    await waitFor(() => expect(api.applyCoupon).toHaveBeenCalledWith({ code: 'VALE15' }));
  });

  it('keeps the coupon field filled when applying fails', async () => {
    api.applyCoupon.mockRejectedValueOnce(new Error('Cupom inválido'));

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );

    await screen.findByText('Camiseta');
    fireEvent.change(screen.getByLabelText('Cupom de desconto'), {
      target: { value: 'ERRO10' }
    });
    fireEvent.click(screen.getByText('Aplicar cupom'));

    await waitFor(() => expect(api.applyCoupon).toHaveBeenCalledWith({ code: 'ERRO10' }));
    expect(screen.getByDisplayValue('ERRO10')).toBeInTheDocument();
  });
});