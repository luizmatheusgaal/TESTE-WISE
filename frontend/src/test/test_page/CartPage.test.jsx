import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CartPage } from '../../pages/CartPage';

vi.mock('../../context/useCart', () => ({
  useCart: vi.fn()
}));

import { useCart } from '../../context/useCart';

describe('CartPage', () => {
  it('shows empty state', () => {
    useCart.mockReturnValue({
      cart: { items: [], subtotal_amount: 0, discount: 0, total: 0, coupon: null },
      pendingAction: null,
      applyCoupon: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn()
    });

    render(<CartPage />);

    expect(screen.getByText(/Seu carrinho está vazio/i)).toBeInTheDocument();
  });

  it('updates quantity and applies coupon', async () => {
    const updateItem = vi.fn();
    const applyCoupon = vi.fn().mockResolvedValue({ ok: true });

    useCart.mockReturnValue({
      cart: {
        items: [
          {
            id: 7,
            name: 'Tênis',
            quantity: 1,
            stock: 3,
            unit_price: 299.9,
            subtotal: 299.9
          }
        ],
        subtotal_amount: 299.9,
        discount: 0,
        total: 299.9,
        coupon: null
      },
      pendingAction: null,
      applyCoupon,
      removeItem: vi.fn(),
      updateItem
    });

    render(<CartPage />);

    fireEvent.click(screen.getByText('+'));
    expect(updateItem).toHaveBeenCalledWith(7, 2);

    fireEvent.change(screen.getByLabelText('Cupom de desconto'), {
      target: { value: 'VALE15' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar cupom' }));

    await waitFor(() => expect(applyCoupon).toHaveBeenCalledWith('VALE15'));
  });
});