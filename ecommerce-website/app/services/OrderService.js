import requests from "./httpServices";

const OrderService = {
  confirmOrder: async (formData) => {
    try {
      const data = await requests.post("/order/confirm-order", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (err) {
      console.error("API error:", err);
    }
  },
  trackOrder: async (trackingId) => {
    if (!trackingId) {
      console.error("Tracking Id is required");
      throw new Error("Tracking Id is required");
    }
    try {
      const data = await requests.get(`/order/track/${trackingId}`);
      return data;
    } catch (err) {
      console.error("API error:", err);
    }
  },
  myOrders: async () => {
    try {
      const data = await requests.get(`/order/my-orders`);
      return data || [];
    } catch (err) {
      console.error("API error:", err);
    }
  },
  getOrderByTrackingId: async (id) => {
    try {
      const data = await requests.get(`/order/${id}`);
      return data;
    } catch (err) {
      console.error("API error:", err);
    }
  },
};

export default OrderService;
