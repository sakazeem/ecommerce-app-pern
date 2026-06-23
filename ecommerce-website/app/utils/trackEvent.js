export const trackEvent = (event, payload = {}, options = {}) => {
  // if (typeof window === "undefined") return;
  // return;

  // ---- Facebook Pixel ----
  const fbEventsMapping = [
    "PageView", // done
    "ViewContent", // done
    "AddToCart",
    "Search",
    "InitiateCheckout",
    "AddPaymentInfo",
    "Purchase",
  ];

  if (window.fbq && fbEventsMapping.includes(event)) {
    // Strip GA-only fields before sending to fbq
    const { items: _items, ...fbPayload } = payload;
    if (options.eventID) {
      window.fbq("track", event, fbPayload, { eventID: options.eventID });
    } else {
      window.fbq("track", event, fbPayload);
    }
  }

  // ---- Google Analytics 4 ----
  const gaMapping = {
    PageView: "page_view",
    ViewContent: "view_item",
    AddToCart: "add_to_cart",
    Search: "search",
    InitiateCheckout: "begin_checkout",
    AddPaymentInfo: "add_payment_info",
    Purchase: "purchase",
  };

  if (window.gtag) {
    window.gtag("event", gaMapping[event] || event, payload);
  }
};
