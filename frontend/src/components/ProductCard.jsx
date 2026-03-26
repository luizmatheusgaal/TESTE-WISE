import { formatCurrency } from '../utils/formatters';

export function ProductCard({ product, isPending, onAdd }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/30">
      <div className="mb-4 h-40 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <img
          src={product.image_url ?? '/product-placeholder.svg'}
          alt={`Imagem do produto ${product.name}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{product.category}</p>
          <h2 className="text-lg font-semibold">{product.name}</h2>
        </div>
        <span className="text-lg font-bold text-emerald-300">{formatCurrency(product.price)}</span>
      </div>

      <div className="mt-auto space-y-3">
        <p className={`text-sm ${product.stock === 0 ? 'text-rose-300' : 'text-slate-300'}`}>
          {product.stock === 0 ? 'Fora de estoque' : `${product.stock} unidades disponíveis`}
        </p>

        <button
          type="button"
          disabled={product.stock === 0 || isPending}
          onClick={onAdd}
          className="w-full rounded-full bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isPending ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </button>

      </div>
    </article>
  );
}