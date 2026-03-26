import { Link, NavLink, Outlet } from 'react-router-dom';

import { useCart } from '../context/useCart';

export function Layout() {
  const { cart, refreshing } = useCart();
  const totalItems = cart.items.reduce((accumulator, item) => accumulator + item.quantity, 0);

  const navClassName = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold ${isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-200'}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <div>
            <Link to="/" className="text-lg font-bold text-emerald-300">
              Wise Sales Store
            </Link>
            <p className="text-xs text-slate-400">Mini e-commerce fullstack</p>
          </div>

          <nav className="flex items-center gap-3">
            <NavLink to="/" className={navClassName}>
              Catálogo
            </NavLink>

            <NavLink to="/cart" className={navClassName}>
              Carrinho ({totalItems})
            </NavLink>
          </nav>
        </div>

        {refreshing && <div className="h-1 animate-pulse bg-emerald-400/70" />}

      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

    </div>
  );
}