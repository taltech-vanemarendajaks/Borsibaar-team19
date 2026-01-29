"use client";

import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

import { POSHeader } from "./POSHeader";
import { ProductCard } from "./ProductCard";
import { CartSidebar } from "./CartSidebar";
import { usePosStation } from "../hooks/usePosStation";

export const dynamic = "force-dynamic";

export default function POSStation() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.stationId as string;

  const {
    station,
    categories,
    selectedCategory,
    searchTerm,
    filteredProducts,
    cart,
    isProcessingSale,
    currentUser,
    loading,
    error,

    setSelectedCategory,
    setSearchTerm,

    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processSale,
  } = usePosStation(stationId);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-4">{error}</p>
          <Button onClick={() => router.push("/pos")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stations
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !filteredProducts?.length) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24 lg:pb-6 w-full">
      <div className="max-w-full mx-auto">
        <POSHeader
          station={station}
          currentUser={currentUser}
          categories={categories}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          productCount={filteredProducts.length}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchTerm}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 order-2 lg:order-1">
            <div
              className={clsx("grid grid-cols-1 sm:grid-cols-2 gap-4", {
                "transition-all duration-300": true,
                "pointer-events-none blur-xs": loading,
                "blur-none": !loading,
              })}
            >
              {filteredProducts.map((product) => {
                const cartItem = cart.find(
                  (item) => item.productId === product.productId,
                );

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItem={cartItem}
                    onAddToCart={addToCart}
                  />
                );
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:w-80">
            <CartSidebar
              cart={cart}
              isProcessingSale={isProcessingSale}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onProcessSale={processSale}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
