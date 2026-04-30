const db = require('../../db/models');

/**
 * Build flat DB fields from a structured event object.
 * Keeps customer/items in dedicated columns AND keeps payload for extras.
 */
function buildRecord(data, isSynced = false) {
	const {
		appUserId = null,
		sessionId = null,
		eventType,
		customer = null,       // { name, email, phone, address, city, country, postalCode, paymentMethod }
		billingAddress = null, // only when different from shipping
		items = null,          // cart items array
		summary = null,        // { subtotal, shipping, total }
		orderTrackingId = null,
		pageUrl = null,
		clientTimestamp = null,
		payload = null,        // anything else (errors, etc.)
	} = data;

	// Normalise cart items to a clean shape
	const order_items = items?.map((item) => ({
		id:                   item.id ?? item.item_id,
		sku:                  item.sku,
		title:                item.title ?? item.item_name,
		qty:                  item.quantity ?? item.qty,
		variantId:            item.selectedVariant?.id ?? item.variantId ?? null,
		variantTitle:         item.selectedVariant?.title ?? item.variantTitle ?? null,
		price:                item.selectedVariant?.price ?? item.price ?? null,
		discount_percentage:  item.selectedVariant?.discount_percentage ?? item.discount_percentage ?? null,
		unitPrice:            item.unitPrice ?? null,
		finalPrice:           item.finalPrice ?? null,
	})) ?? null;

	// billing goes into payload only if it differs from shipping
	const extraPayload = billingAddress
		? { ...(payload || {}), billingAddress }
		: payload || null;

	return {
		app_user_id:          appUserId,
		session_id:           sessionId,
		event_type:           eventType,
		customer_name:        customer?.name  ?? null,
		customer_email:       customer?.email ?? null,
		customer_phone:       customer?.phone ?? null,
		shipping_address:     customer?.address     ?? null,
		shipping_city:        customer?.city        ?? null,
		shipping_country:     customer?.country     ?? null,
		shipping_postal_code: customer?.postalCode  ?? null,
		payment_method:       customer?.paymentMethod ?? null,
		subtotal:             summary?.subtotal  ?? null,
		shipping_cost:        summary?.shipping  ?? null,
		total:                summary?.total     ?? null,
		order_items,
		payload:              extraPayload,
		order_tracking_id:    orderTrackingId,
		page_url:             pageUrl,
		client_timestamp:     clientTimestamp ? new Date(clientTimestamp) : null,
		is_synced:            isSynced,
		created_at:           new Date(),
	};
}

async function logActivity(data) {
	return db.user_activity_log.create(buildRecord(data, false));
}

async function logActivityBatch(events) {
	if (!events?.length) return 0;
	const records = events.slice(0, 500).map((e) => buildRecord(e, true));
	const result = await db.user_activity_log.bulkCreate(records);
	return result.length;
}

module.exports = { logActivity, logActivityBatch };
