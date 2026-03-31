const catchAsync = require('../../utils/catchAsync');
const { adminDashboardService } = require('../../services/Admin');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');

const getDashboardData = catchAsync(async (req, res) => {
	const todayStart = startOfDay(new Date());
	const todayEnd = endOfDay(new Date());

	const monthStart = startOfMonth(new Date());
	const monthEnd = endOfMonth(new Date());

	const { startDate, endDate } = req.query;

	const trendStart = startDate
		? startOfDay(new Date(startDate))
		: startOfDay(new Date());
	const trendEnd = endDate
		? endOfDay(new Date(endDate))
		: endOfDay(new Date());

	const [
		today,
		month,
		pending,
		trend,
		statusBreakdown,
		paymentSplit,
		recentOrders,
	] = await Promise.all([
		adminDashboardService.getTodayKPI(todayStart, todayEnd),
		adminDashboardService.getMonthKPI(monthStart, monthEnd),
		adminDashboardService.getPendingKPI(),
		adminDashboardService.getOrdersTrend(trendStart, trendEnd),
		adminDashboardService.getOrderStatusBreakdown(),
		adminDashboardService.getRevenueByPaymentMethod(),
		adminDashboardService.getRecentOrders(),
	]);

	res.send({
		today,
		month,
		pending,
		trend,
		statusBreakdown,
		paymentSplit,
		recentOrders,
	});
});

module.exports = {
	getDashboardData,
};
