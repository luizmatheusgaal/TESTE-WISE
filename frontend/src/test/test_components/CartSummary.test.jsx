import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CartSummary } from '../../components/CartSummary';

describe('CartSummary', () => {
  it('renders totals and applied coupon', () => {
    render(
      <CartSummary
        cart={{
          items: [],
          subtotal_amount: 100,
          discount: 10,
          total: 90,
          coupon: { code: 'DESCONTO10' }
        }}
      />
    );

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Desconto')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Cupom aplicado: DESCONTO10')).toBeInTheDocument();
  });
});