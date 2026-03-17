import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "../utils/trackEvent";
import CartService from "../services/CartService";
import FavouriteService from "../services/FavouriteService";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      favourites: [],

      // ─── LOAD (called on mount and after login) ───────────────────
      loadCart: async (isAuthenticated) => {
        if (isAuthenticated) {
          try {
            const res = await CartService.getCart();
            // Normalize DB cart items to match the shape the UI expects
            const normalized = (res.cart || []).map((item) => ({
              cartItemId: item.id,
              id: item.product?.id,
              title: item.product?.product_translations?.[0]?.title || "",
              slug: item.product?.product_translations?.[0]?.slug || "",
              thumbnail:
                item.product?.thumbnailImage?.url || item.product?.thumbnail,
              sku: item.product?.sku,
              base_price: item.product?.base_price,
              base_discount_percentage: item.product?.base_discount_percentage,
              quantity: item.quantity,
              selectedVariant: item.product_variant || null,
            }));
            set({ cart: normalized });
          } catch (e) {
            console.error("loadCart error", e);
          }
        } else {
          // Guest — already persisted via zustand persist
        }
      },

      loadFavourites: async (isAuthenticated) => {
        if (isAuthenticated) {
          try {
            const res = await FavouriteService.getFavourites();
            const normalized = (res.favourites || []).map((item) => ({
              id: item.product?.id,
              title: item.product?.product_translations?.[0]?.title || "",
              slug: item.product?.product_translations?.[0]?.slug || "",
              thumbnail:
                item.product?.thumbnailImage?.url || item.product?.thumbnail,
              sku: item.product?.sku,
              base_price: item.product?.base_price,
              base_discount_percentage: item.product?.base_discount_percentage,
            }));
            set({ favourites: normalized });
          } catch (e) {
            console.error("loadFavourites error", e);
          }
        }
      },

      // ─── SYNC ─────────────────────────────────────────────────────
      syncToDb: async () => {
        const { cart, favourites } = get();
        try {
          if (cart.length) {
            await CartService.syncCart(cart);
          }
          if (favourites.length) {
            const productIds = favourites.map((f) => f.id).filter(Boolean);
            if (productIds.length) {
              await FavouriteService.syncFavourites(productIds);
            }
          }
          // Clear local guest data after syncing — DB is now the source of truth
          set({ cart: [], favourites: [] });
        } catch (e) {
          console.error("syncToDb error", e);
        }
      },

      // ─── CART ─────────────────────────────────────────────────────
      addToCart: async (product, quantity = 1, isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            await CartService.addToCart({
              product_id: product.id,
              product_variant_id: product.selectedVariant?.id || null,
              quantity,
            });
            await get().loadCart(true);
          } catch (e) {
            console.error("addToCart error", e);
          }
        } else {
          // Guest localStorage logic
          const cart = get().cart;
          const existing = cart.find((item) =>
            item.selectedVariant
              ? item.id === product.id &&
                item.selectedVariant.id === product.selectedVariant?.id
              : item.sku === product.sku,
          );
          const updatedCart = existing
            ? cart.map((item) =>
                (
                  item.selectedVariant
                    ? item.id === product.id &&
                      item.selectedVariant.id === product.selectedVariant?.id
                    : item.sku === product.sku
                )
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...cart, { ...product, quantity }];
          set({ cart: updatedCart });
        }

        trackEvent("AddToCart", {
          content_ids: [product.id],
          content_name: product.title,
          sku: product.sku,
          quantity,
          value: product.selectedVariant?.price || product.base_price,
          currency: "PKR",
        });
      },

      removeFromCart: async (product, isAuthenticated = false) => {
        if (isAuthenticated && product.cartItemId) {
          try {
            await CartService.removeFromCart(product.cartItemId);
            await get().loadCart(true);
          } catch (e) {
            console.error("removeFromCart error", e);
          }
        } else {
          set({
            cart: get().cart.filter((item) =>
              item.selectedVariant && product.selectedVariant
                ? !(
                    item.id === product.id &&
                    item.selectedVariant.id === product.selectedVariant.id
                  )
                : item.sku !== product.sku,
            ),
          });
        }
      },

      updateQuantity: async (product, quantity, isAuthenticated = false) => {
        if (isAuthenticated && product.cartItemId) {
          try {
            await CartService.updateCartItem(product.cartItemId, quantity);
            await get().loadCart(true);
          } catch (e) {
            console.error("updateQuantity error", e);
          }
        } else {
          set({
            cart: get().cart.map((item) =>
              (
                item.selectedVariant && product.selectedVariant
                  ? item.id === product.id &&
                    item.selectedVariant.id === product.selectedVariant.id
                  : item.sku === product.sku
              )
                ? { ...item, quantity }
                : item,
            ),
          });
        }
      },

      clearCart: async (isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            await CartService.clearCart();
          } catch (e) {
            console.error("clearCart error", e);
          }
        }
        set({ cart: [] });
      },

      // ─── FAVOURITES ───────────────────────────────────────────────
      toggleFavourite: async (product, isAuthenticated = false) => {
        if (isAuthenticated) {
          try {
            await FavouriteService.toggleFavourite(product.id);
            await get().loadFavourites(true);
          } catch (e) {
            console.error("toggleFavourite error", e);
          }
        } else {
          const favourites = get().favourites;
          const exists = favourites.find((item) => item.id === product.id);
          set({
            favourites: exists
              ? favourites.filter((item) => item.id !== product.id)
              : [...favourites, product],
          });
        }
      },

      clearFavourites: () => set({ favourites: [] }),
    }),
    { name: "ecommerce-storage" },
  ),
);
