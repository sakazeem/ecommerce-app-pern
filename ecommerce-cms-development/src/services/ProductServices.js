import requests, { instance } from "./httpService";

const ProductServices = {
  getAllProducts: async (query) => {
    return requests.get(`/product${query ? `?${query}` : ""}`);
  },
  getAllProductTitles: async () => {
    return requests.get(`/product/only-titles`);
  },

  /**
   * Search products by name or ID — used by the Mixed Products "Selected Products" field in SectionForm.
   * Queries the admin products endpoint with pagination + search so we never load all products at once.
   */
  getProductSuggestions: async ({ search = "", limit = 10, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page });
    if (search) params.set("search", search);
    return requests.get(`/product?${params.toString()}`);
  },

  getProductById: async (id) => {
    return requests.get(`/product/${id}`);
  },

  addProduct: async (body) => {
    return requests.post("/product", body);
  },

  updateProduct: async (id, body) => {
    return requests.patch(`/product/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.patch(`/product/${id}`, body);
  },

  deleteProduct: async (id, body) => {
    return requests.delete(`/product/${id}`, body);
  },

  importProducts: async (body) => {
    return requests.post(`/product/import-products`, body);
  },
  importProductPrices: async (body) => {
    return requests.post(`/product/import-variant-prices`, body);
  },

  exportProducts: async () => {
    return instance.get(`/product/export-products`, {
      responseType: "blob",
    });
  },

  // addAllProduct: async (body) => {
  // 	return requests.post("/product", body);
  // },

  // updateManyProduct: async (body) => {
  // 	return requests.patch("/product/update/many", body);
  // },

  // deleteManyProduct: async (body) => {
  // 	return requests.patch("/product/delete/many", body);
  // },
};

export default ProductServices;
