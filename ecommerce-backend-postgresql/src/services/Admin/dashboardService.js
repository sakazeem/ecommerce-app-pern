const { Op, fn, col, QueryTypes } = require('sequelize');
const db = require('../../db/models');
const {
	COMPLETED_STATUS,
	ACTIVE_STATUSES,
} = require('../../constants/orderConstants');

/* =========================
   ROW 1 — KPI CARDS
========================= */

async function getTodayKPI(start, end) {
	const data = await db.order.findOne({
		attributes: [
			[fn('COUNT', col('id')), 'count'],
			[fn('COALESCE', fn('SUM', col('total')), 0), 'amount'],
		],
		where: {
			status: COMPLETED_STATUS,
			created_at: { [Op.between]: [start, end] },
		},
		raw: true,
	});

	return {
		count: Number(data.count),
		amount: Number(data.amount),
	};
}

async function getMonthKPI(start, end) {
	return getTodayKPI(start, end);
}

async function getPendingKPI() {
	const count = await db.order.count({
		where: {
			status: { [Op.in]: ACTIVE_STATUSES },
		},
	});

	return { count };
}

/* =========================
   ROW 2 — ORDERS TREND
========================= */

async function getOrdersTrend(startDate, endDate) {
	const tableName = db.order.getTableName();

	return db.sequelize.query(
		`
		SELECT
			DATE("created_at") AS date,
			COUNT(*) AS orders,
			COALESCE(SUM(total), 0) AS revenue
		FROM "${tableName}"
		WHERE
			status = 'delivered'
			AND "created_at" BETWEEN :startDate AND :endDate
		GROUP BY DATE("created_at")
		ORDER BY DATE("created_at")
		`,
		{
			replacements: { startDate, endDate },
			type: QueryTypes.SELECT,
		}
	);
}

/* =========================
   ROW 3 — STATUS BREAKDOWN
========================= */

async function getOrderStatusBreakdown() {
	const ALL_STATUSES = [
		'pending',
		'in_progress',
		'cancelled',
		'delivered',
		'return_requested',
		// 'returned',
		// 'refunded',
		// 'exchanged',
	];

	const rows = await db.order.findAll({
		attributes: ['status', [fn('COUNT', col('id')), 'count']],
		group: ['status'],
		raw: true,
	});

	// Initialize all with 0
	const result = {};
	ALL_STATUSES.forEach((status) => {
		result[status] = 0;
	});

	// Override with actual counts
	rows.forEach((row) => {
		result[row.status] = Number(row.count);
	});

	return result;
}

/* =========================
   ROW 4 — PAYMENT SPLIT
========================= */

async function getRevenueByPaymentMethod() {
	return db.order.findAll({
		attributes: [
			'payment_method',
			[fn('COUNT', col('id')), 'orders'],
			[fn('COALESCE', fn('SUM', col('total')), 0), 'revenue'],
		],
		where: {
			status: COMPLETED_STATUS,
		},
		group: ['payment_method'],
		raw: true,
	});
}

/* =========================
   ROW 5 — RECENT ORDERS
========================= */

async function getRecentOrders(limit = 10) {
	return db.order.findAll({
		attributes: ['id', 'total', 'payment_method', 'status', 'created_at'],
		order: [['created_at', 'DESC']],
		limit,
	});
}

module.exports = {
	getTodayKPI,
	getMonthKPI,
	getPendingKPI,
	getOrdersTrend,
	getOrderStatusBreakdown,
	getRevenueByPaymentMethod,
	getRecentOrders,
};
