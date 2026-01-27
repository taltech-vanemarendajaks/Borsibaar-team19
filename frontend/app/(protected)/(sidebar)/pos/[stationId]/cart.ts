import { CartItem, Product } from "./types";

export function addToCart(cart: CartItem[], product: Product): CartItem[] {
  const existingItem = cart.find(
    (item) => item.productId === product.productId,
  );

  if (existingItem) {
    if (existingItem.quantity < product.quantity) {
      return cart.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    }
    return cart;
  }

  if (product.quantity > 0) {
    return [
      ...cart,
      {
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        maxQuantity: product.quantity,
        unitPrice: product.unitPrice,
      },
    ];
  }

  return cart;
}

export function updateCartQuantity(
  cart: CartItem[],
  productId: number,
  change: number,
): CartItem[] {
  return cart
    .map((item) => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        if (newQuantity <= item.maxQuantity)
          return { ...item, quantity: newQuantity };
      }
      return item;
    })
    .filter(Boolean) as CartItem[];
}

export function removeFromCart(
  cart: CartItem[],
  productId: number,
): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

export function clearCart(): CartItem[] {
  return [];
}
