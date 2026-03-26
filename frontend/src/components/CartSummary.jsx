import { formatCurrency } from '../utils/formatters';

export function CartSummary({ cart }) {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">Resumo</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(cart.subtotal_amount)}</dd>
        </div>

        <div className="flex justify-between">
          <dt>Desconto</dt>
          <dd>- {formatCurrency(cart.discount)}</dd>
        </div>

        <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatCurrency(cart.total)}</dd>
        </div>

        {cart.coupon && (
          <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-200">
            Cupom aplicado: {cart.coupon.code}
          </div>
        )}
      </dl>
    </aside>
  );
}