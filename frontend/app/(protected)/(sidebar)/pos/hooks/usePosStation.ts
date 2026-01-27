"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarStation, CurrentUser } from "../types";
import { fetchCurrentUser } from "@/lib/api/account";
import { fetchCategories as fetchCategoriesApi } from "@/lib/api/categories";
import { fetchProducts as fetchProductsApi } from "@/lib/api/inventory";
import { fetchStation as fetchStationApi } from "@/lib/api/stations";
import { processSale as processSaleApi } from "@/lib/api/sales";
import { CartItem, Category, Product } from "../[stationId]/types";
import * as cartService from "../[stationId]/cart";

export function usePosStation(stationId: string) {
  const [station, setStation] = useState<BarStation | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const fetchStation = useCallback(async () => {
    try {
      const data = await fetchStationApi(stationId);
      setStation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [stationId]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProductsApi(selectedCategory);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchCategoriesApi();
      setCategories(data);
    } catch (err) {
      // keep your existing behavior: log only
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchCurrentUserLocal = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();
      setCurrentUser(data);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  // Initial load + localStorage load + polling
  useEffect(() => {
    fetchStation();
    fetchProducts();
    fetchCategories();
    fetchCurrentUserLocal();

    const savedCart = localStorage.getItem(`pos-cart-${stationId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const refreshInterval = setInterval(fetchProducts, 1000 * 60);
    return () => clearInterval(refreshInterval);
  }, [
    stationId,
    fetchProducts,
    fetchStation,
    fetchCategories,
    fetchCurrentUserLocal,
  ]);

  // Save cart
  useEffect(() => {
    localStorage.setItem(`pos-cart-${stationId}`, JSON.stringify(cart));
  }, [cart, stationId]);

  // Cart handlers (same names, but using pure functions)
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => cartService.addToCart(prev, product));
  }, []);

  const updateCartQuantity = useCallback(
    (productId: number, change: number) => {
      setCart((prev) =>
        cartService.updateCartQuantity(prev, productId, change),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => cartService.removeFromCart(prev, productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart(cartService.clearCart());
  }, []);

  const processSale = useCallback(async () => {
    if (cart.length === 0) return;

    setIsProcessingSale(true);
    try {
      const saleRequest = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: `POS Sale - Station: ${station?.name}`,
        barStationId: parseInt(stationId),
      };

      await processSaleApi(saleRequest);

      clearCart();
      await fetchProducts();
    } catch (err) {
      alert(
        `Error processing sale: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    } finally {
      setIsProcessingSale(false);
    }
  }, [cart, station?.name, stationId, clearCart, fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  return {
    station,
    products,
    categories,
    loading,
    error,
    searchTerm,
    selectedCategory,
    cart,
    isProcessingSale,
    currentUser,
    filteredProducts,

    setSearchTerm,
    setSelectedCategory,

    fetchProducts,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processSale,
  };
}
