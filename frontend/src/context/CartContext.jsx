import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';

import { api } from '../api/client';

const INITIAL_CART = {
  items: [],
  subtotal_amount: 0,
  discount: 0,
  total: 0,
  coupon: null
};

const INITIAL_STATE = {
  cart: INITIAL_CART,
  loading: true,
  refreshing: false,
  pendingAction: null,
  feedback: null
};

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: action.initialLoad,
        refreshing: !action.initialLoad,
        feedback: action.keepFeedback ? state.feedback : null
      };
    case 'ACTION_START':
      return {
        ...state,
        pendingAction: action.pendingAction,
        feedback: null
      };
    case 'SUCCESS':
      return {
        ...state,
        cart: action.cart,
        loading: false,
        refreshing: false,
        pendingAction: null,
        feedback: action.feedback ?? null
      };
    case 'FAILURE':
      return {
        ...state,
        loading: false,
        refreshing: false,
        pendingAction: null,
        feedback: {
          type: 'error',
          message: action.message,
          details: action.details ?? []
        }
      };
    case 'CLEAR_FEEDBACK':
      return {
        ...state,
        feedback: null
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);

  const execute = useCallback(async ({ action, successMessage, pendingAction, initialLoad = false }) => {
    dispatch({
      type: pendingAction ? 'ACTION_START' : 'FETCH_START',
      pendingAction,
      initialLoad,
      keepFeedback: !pendingAction
    });

    try {
      const nextCart = await action();
      dispatch({
        type: 'SUCCESS',
        cart: nextCart,
        feedback: successMessage
          ? {
              type: 'success',
              message: successMessage
            }
          : null
      });
      return { ok: true, cart: nextCart };
    } catch (error) {
      dispatch({
        type: 'FAILURE',
        message: error.message,
        details: error.details
      });
      return { ok: false, error };
    }
  }, []);

  const refreshCart = useCallback(
    ({ initialLoad = false } = {}) =>
      execute({
        action: () => api.getCart(),
        initialLoad
      }),
    [execute]
  );

  useEffect(() => {
    refreshCart({ initialLoad: true });
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      cart: state.cart,
      loading: state.loading,
      refreshing: state.refreshing,
      pendingAction: state.pendingAction,
      feedback: state.feedback,
      clearFeedback: () => dispatch({ type: 'CLEAR_FEEDBACK' }),

      addItem: (productId, quantity = 1) =>
        execute({
          pendingAction: `add:${productId}`,
          successMessage: 'Produto adicionado ao carrinho.',
          action: () => api.addCartItem({ product_id: productId, quantity })
        }),

      updateItem: (itemId, quantity) =>
        execute({
          pendingAction: `item:${itemId}`,
          successMessage: 'Carrinho atualizado.',
          action: () => api.updateCartItem(itemId, { quantity })
        }),

      removeItem: (itemId) =>
        execute({
          pendingAction: `item:${itemId}`,
          successMessage: 'Item removido do carrinho.',
          action: () => api.removeCartItem(itemId)
        }),

      applyCoupon: (code) =>
        execute({
          pendingAction: 'coupon',
          successMessage: 'Cupom aplicado com sucesso.',
          action: () => api.applyCoupon({ code: code.trim() })
        }),

      refreshCart

    }),

    [execute, refreshCart, state]

);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }
  return context;
}