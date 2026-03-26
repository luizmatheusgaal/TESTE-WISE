import { FeedbackBanner } from '../components/FeedbackBanner';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/useCart';
import { useProducts } from '../hooks/useProducts';

export function CatalogPage() {
  const { addItem, pendingAction } = useCart();
  const {
    products,
    category,
    categories,
    loadingInitial,
    refreshing,
    error,
    setCategory,
    allCategoriesValue
  } = useProducts();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Mini e-commerce</p>
          <h1 className="text-3xl font-bold">Catálogo inteligente</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Explore os produtos, filtre por categoria e adicione itens ao carrinho com validação de estoque em tempo real.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option === allCategoriesValue ? 'Todas' : option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <FeedbackBanner />

      {refreshing && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
          Atualizando produtos...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {loadingInitial ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-300">
          Carregando produtos...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
          Nenhum produto encontrado para a categoria selecionada.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isPending={pendingAction === `add:${product.id}`}
              onAdd={() => addItem(product.id, 1)}
            />
          ))}
        </div>
      )}
    </section>
  );
}