const catchAsync = require('../../utils/catchAsync');
const {
	logActivity,
	logActivityBatch,
} = require('../../services/Api/activityLogService');
const { verifyToken } = require('../../utils/auth');

async function getUserIdFromCookie(req) {
	try {
		const accessToken = req.cookies?.accessToken;
		if (accessToken) {
			const tokenPayload = await verifyToken(accessToken);
			return tokenPayload?.userId ?? null;
		}
	} catch (_) {}
	return null;
}

/**
 * POST /v1/activity/log
 */
const logSingle = catchAsync(async (req, res) => {
	const {
		sessionId,
		eventType,
		customer,
		billingAddress,
		items,
		summary,
		orderTrackingId,
		pageUrl,
		clientTimestamp,
		payload,
	} = req.body;

	if (!eventType) {
		return res.status(400).json({ message: 'eventType is required' });
	}

	const appUserId = await getUserIdFromCookie(req);

	const log = await logActivity({
		appUserId,
		sessionId,
		eventType,
		customer,
		billingAddress,
		items,
		summary,
		orderTrackingId,
		pageUrl,
		clientTimestamp,
		payload,
		isSynced: false,
	});

	res.status(201).json({ success: true, id: log.id });
});

/**
 * POST /v1/activity/sync
 */
const syncBatch = catchAsync(async (req, res) => {
	const { events } = req.body;

	if (!Array.isArray(events) || events.length === 0) {
		return res.status(400).json({ message: 'events array is required' });
	}

	const appUserId = await getUserIdFromCookie(req);

	const enrichedEvents = events.slice(0, 500).map((e) => ({
		...e,
		appUserId: e.appUserId ?? appUserId,
	}));

	const count = await logActivityBatch(enrichedEvents);

	res.status(201).json({ success: true, inserted: count });
});

module.exports = { logSingle, syncBatch };
