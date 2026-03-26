import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeedbackBanner } from '../../components/FeedbackBanner';

vi.mock('../../context/useCart', () => ({
  useCart: vi.fn()
}));

import { useCart } from '../../context/useCart';

describe('FeedbackBanner', () => {
  it('keeps a fixed vertical space even without feedback to avoid layout jump', () => {
    useCart.mockReturnValue({
      feedback: null,
      clearFeedback: vi.fn()
    });

    const { container } = render(<FeedbackBanner />);
    const wrapper = container.firstChild;

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('min-h-[62px]');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders feedback message and details when present', () => {
    useCart.mockReturnValue({
      feedback: {
        type: 'error',
        message: 'Estoque insuficiente.',
        details: [{ field: 'quantity', message: 'Valor acima do estoque.' }]
      },
      clearFeedback: vi.fn()
    });

    render(<FeedbackBanner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Estoque insuficiente.')).toBeInTheDocument();
    expect(screen.getByText('quantity: Valor acima do estoque.')).toBeInTheDocument();
  });
});