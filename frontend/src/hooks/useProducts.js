import { useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../api/client';

const ALL_CATEGORIES = 'todas';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState([ALL_CATEGORIES]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const isFirstLoad = !hasLoadedRef.current;
      if (isFirstLoad) {
        setLoadingInitial(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const [allProducts, filteredProducts] = await Promise.all([
          api.getProducts(),
          api.getProducts({ category: category === ALL_CATEGORIES ? undefined : category })
        ]);

        if (!active) {
          return;
        }

        setCategories([
          ALL_CATEGORIES,
          ...new Set(allProducts.map((product) => product.category))
        ]);
        setProducts(filteredProducts);
        hasLoadedRef.current = true;
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (!active) {
          return;
        }

        if (isFirstLoad) {
          setLoadingInitial(false);
        }
        setRefreshing(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [category]);

  return useMemo(
    () => ({
      products,
      category,
      categories,
      loadingInitial,
      refreshing,
      error,
      setCategory,
      allCategoriesValue: ALL_CATEGORIES
    }),
    [products, category, categories, loadingInitial, refreshing, error]
  );
}