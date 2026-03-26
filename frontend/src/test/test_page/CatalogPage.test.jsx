import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CatalogPage } from '../../pages/CatalogPage';

vi.mock('../../context/useCart', () => ({
  useCart: vi.fn()
}));

vi.mock('../../hooks/useProducts', () => ({
  useProducts: vi.fn()
}));

import { useCart } from '../../context/useCart';
import { useProducts } from '../../hooks/useProducts';

describe('CatalogPage', () => {
  it('renders products and adds item', () => {
    const addItem = vi.fn();
    useCart.mockReturnValue({ addItem, pendingAction: null });
    useProducts.mockReturnValue({
      products: [
        {
          id: 1,
          name: 'Camiseta',
          category: 'roupas',
          price: 49.9,
          stock: 3,
          image_url: null
        }
      ],
      category: 'todas',
      categories: ['todas', 'roupas'],
      loadingInitial: false,
      refreshing: false,
      error: null,
      setCategory: vi.fn(),
      allCategoriesValue: 'todas'
    });

    render(<CatalogPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }));
    expect(addItem).toHaveBeenCalledWith(1, 1);
  });

  it('shows loading state', () => {
    useCart.mockReturnValue({ addItem: vi.fn(), pendingAction: null });
    useProducts.mockReturnValue({
      products: [],
      category: 'todas',
      categories: ['todas'],
      loadingInitial: true,
      refreshing: false,
      error: null,
      setCategory: vi.fn(),
      allCategoriesValue: 'todas'
    });

    render(<CatalogPage />);

    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
  });
});