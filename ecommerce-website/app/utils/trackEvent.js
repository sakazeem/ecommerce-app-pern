export const trackEvent = (event, payload = {}) => {
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
		window.fbq("track", event, payload);
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
