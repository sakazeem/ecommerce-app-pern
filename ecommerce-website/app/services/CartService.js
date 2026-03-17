import requests from "./httpServices";

const CartService = {
  getCart: () => requests.get("/cart"),
  addToCart: (body) => requests.post("/cart", body),
  updateCartItem: (id, quantity) => requests.patch(`/cart/${id}`, { quantity }),
  removeFromCart: (id) => requests.delete(`/cart/${id}`),
  clearCart: () => requests.delete("/cart/clear"),
  syncCart: (items) => requests.post("/cart/sync", { items }),
};

export default CartService;
