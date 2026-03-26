import { useEffect, useMemo, useState } from 'react';

import { api } from '../api/client';

const ALL_CATEGORIES = 'todas';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState([ALL_CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const [allProducts, filteredProducts] = await Promise.all([
          api.getProducts(),
          api.getProducts({ category: category === ALL_CATEGORIES ? undefined : category })
        ]);

        setCategories([
          ALL_CATEGORIES,
          ...new Set(allProducts.map((product) => product.category))
        ]);
        setProducts(filteredProducts);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [category]);

  return useMemo(
    () => ({
      products,
      category,
      categories,
      loading,
      error,
      setCategory,
      allCategoriesValue: ALL_CATEGORIES
    }),
    [products, category, categories, loading, error]
  );
}