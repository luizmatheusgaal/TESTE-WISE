import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { CartPage } from '../pages/CartPage';
import { CatalogPage } from '../pages/CatalogPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'cart', element: <CartPage /> }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}