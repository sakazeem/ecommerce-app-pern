const db = require('../../db/models');
const createBaseService = require('../../utils/baseService');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

const subscriberService = createBaseService(db.subscriber, {
	name: 'Subscriber',
	formatCreateData: (data) => {},
	formatUpdateData: (data) => {},
});

async function getSubscribers(req) {
	const { page = 1, limit = 1000, startDate, endDate } = req.query;
	const whereCondition = {};

	const start = startDate ? new Date(startDate) : null;
	const end = endDate
		? new Date(new Date(endDate).setHours(23, 59, 59, 999))
		: null;

	if (start && end) {
		whereCondition.created_at = { [Op.between]: [start, end] };
	} else if (start) {
		whereCondition.created_at = { [Op.gte]: start };
	} else if (end) {
		whereCondition.created_at = { [Op.lte]: end };
	}

	const data = await db.subscriber.findAndCountAll({
		where: whereCondition,
		order: [['id', 'DESC']],
		limit: Number(limit),
		offset: (Number(page) - 1) * Number(limit),
		distinct: true,
		col: 'id',
	});

	return {
		total: data.count,
		records: data.rows,
		limit,
		page,
	};
}

async function exportSubscribers(req, res) {
	const { startDate, endDate } = req.query;
	const whereCondition = {};

	const start = startDate ? new Date(startDate) : null;
	const end = endDate
		? new Date(new Date(endDate).setHours(23, 59, 59, 999))
		: null;

	if (start && end) {
		whereCondition.created_at = { [Op.between]: [start, end] };
	} else if (start) {
		whereCondition.created_at = { [Op.gte]: start };
	} else if (end) {
		whereCondition.created_at = { [Op.lte]: end };
	}

	const subscribers = await db.subscriber.findAll({
		where: whereCondition,
		order: [['id', 'ASC']],
	});

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Subscribers');

	sheet.columns = [
		{ header: 'ID', key: 'id', width: 10 },
		{ header: 'Name', key: 'name', width: 25 },
		{ header: 'Email', key: 'email', width: 35 },
		{ header: 'Status', key: 'status', width: 15 },
		{ header: 'Subscribed Date', key: 'created_at', width: 20 },
	];

	sheet.getRow(1).eachCell((cell) => {
		cell.font = { bold: true };
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFE0E0E0' },
		};
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' },
		};
	});

	subscribers.forEach((s) => {
		const row = s.get({ plain: true });
		sheet.addRow({
			id: row.id,
			name: row.name || '',
			email: row.email,
			status: row.status,
			created_at: new Date(row.created_at).toLocaleDateString(),
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	res.setHeader(
		'Content-Type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	);
	res.setHeader(
		'Content-Disposition',
		`attachment; filename="subscribers_export_${Date.now()}.xlsx"`
	);
	return res.send(buffer);
}

module.exports = {
	getSubscribers,
	exportSubscribers,
};
