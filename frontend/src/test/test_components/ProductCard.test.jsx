import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductCard } from '../../components/ProductCard';

const baseProduct = {
  id: 1,
  name: 'Camiseta',
  category: 'roupas',
  price: 49.9,
  stock: 3,
  image_url: null
};

describe('ProductCard', () => {
  it('renders fallback image and calls onAdd', () => {
    const onAdd = vi.fn();

    render(<ProductCard product={baseProduct} isPending={false} onAdd={onAdd} />);

    expect(screen.getByAltText('Imagem do produto Camiseta')).toHaveAttribute(
      'src',
      '/public/product-placeholder.svg'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('disables CTA when out of stock', () => {
    render(
      <ProductCard
        product={{ ...baseProduct, stock: 0 }}
        isPending={false}
        onAdd={vi.fn()}
      />
    );

    expect(screen.getByText('Fora de estoque')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  });
});