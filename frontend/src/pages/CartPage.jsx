import { useState } from 'react';

import { CartSummary } from '../components/CartSummary';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export function CartPage() {
  const { cart, pendingAction, applyCoupon, removeItem, updateItem } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    const result = await applyCoupon(couponCode);
    if (result.ok) {
      setCouponCode('');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Sua compra</p>
        <h1 className="text-3xl font-bold">Carrinho</h1>
        <p className="mt-2 text-sm text-slate-400">
          Ajuste quantidades, remova itens e aplique cupons sem perder o estado ao navegar pela aplicação.
        </p>
      </div>

      <FeedbackBanner />

      {cart.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
          Seu carrinho está vazio. Volte ao catálogo para adicionar produtos.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const itemPending = pendingAction === `item:${item.id}`;

              return (
                <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <p className="text-sm text-slate-400">{formatCurrency(item.unit_price)} por unidade</p>
                      <p className="text-sm text-slate-500">Estoque disponível: {item.stock}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={itemPending}
                        onClick={() => updateItem(item.id, Math.max(item.quantity - 1, 0))}
                        className="rounded-full border border-slate-700 px-4 py-2"
                      >
                        -
                      </button>

                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>

                      <button
                        type="button"
                        disabled={itemPending || item.quantity >= item.stock}
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="rounded-full border border-slate-700 px-4 py-2"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
                    <span>Subtotal: {formatCurrency(item.subtotal)}</span>
                    <button
                      type="button"
                      disabled={itemPending}
                      onClick={() => removeItem(item.id)}
                      className="text-rose-300 hover:text-rose-200 disabled:cursor-progress disabled:opacity-70"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              );
            })}

            <form onSubmit={handleApplyCoupon} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <label className="mb-3 block text-sm text-slate-300" htmlFor="coupon">
                Cupom de desconto
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  id="coupon"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Ex.: DESCONTO10"
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <button
                  type="submit"
                  disabled={pendingAction === 'coupon' || !couponCode.trim()}
                  className="rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {pendingAction === 'coupon' ? 'Aplicando...' : 'Aplicar cupom'}
                </button>
              </div>
            </form>
          </div>

          <CartSummary cart={cart} />
        </div>
      )}
    </section>
  );
}