const httpStatus = require('http-status');
const config = require('../../config/config');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const { getOffset } = require('../../utils/query');
const { Op, where } = require('sequelize');
const ExcelJS = require('exceljs');
const { default: axios } = require('axios');
const { sendEmail } = require('../email.service');
const {
	orderInProcessCustomerTemplate,
} = require('../../config/emailTemplates/orderInprocessUser');

async function getOrderById(req) {
	const { orderId } = req.params;
	const order = db.order.findByPk(orderId, {
		include: [
			{
				model: db.order_item,
				include: [
					{
						model: db.product,
						required: false,
						include: [
							{
								model: db.media,
								required: false,
								as: 'thumbnailImage',
								attributes: ['url', 'title', 'size'],
							},
						],
					},
					{
						model: db.product_variant,
						required: false,
						include: [
							{
								model: db.attribute,
								required: false,
								through: {
									as: 'pva',
								},
								attributes: ['id', 'name'],
							},
						],
					},
				],
			},
			{ model: db.app_user, as: 'user', required: false },
		],
	});

	if (!order) throw new ApiError(httpStatus.NOT_FOUND, `Order not found`);
	return order;
}

async function getAllOrders(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		status,
		trackingId,
		paymentMethod,
		startDate,
		endDate,
		search,
		sku,
	} = req.query;
	const offset = getOffset(page, limit);

	const whereCondition = {};
	if (status) {
		whereCondition.status = status;
	}
	if (paymentMethod) {
		whereCondition.payment_method = paymentMethod;
	}
	if (trackingId) {
		whereCondition.tracking_id = trackingId;
	}

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

	/**
	 * 🔎 SEARCH LOGIC
	 */
	if (search) {
		whereCondition[Op.or] = [
			// search by tracking id
			{
				tracking_id: {
					[Op.iLike]: `%${search}%`,
				},
			},

			// search guest name
			{
				guest_first_name: {
					[Op.iLike]: `%${search}%`,
				},
			},

			// search logged in user name
			{
				'$user.name$': {
					[Op.iLike]: `%${search}%`,
				},
			},
		];
	}

	/**
	 * 🔎 SKU FILTER — use subquery to avoid breaking findAndCountAll's COUNT query
	 */
	if (sku) {
		const matchingItems = await db.order_item.findAll({
			attributes: ['order_id'],
			where: { sku: { [Op.iLike]: `%${sku}%` } },
			raw: true,
		});
		const matchingOrderIds = matchingItems.map((item) => item.order_id);
		// Use [-1] if no matches so the query returns 0 results instead of all results
		whereCondition.id = {
			[Op.in]: matchingOrderIds.length ? matchingOrderIds : [-1],
		};
	}

	const orders = await db.order.findAndCountAll({
		offset,
		limit,
		where: whereCondition,
		include: [
			{
				model: db.app_user,
				as: 'user',
				required: false,
			},
		],
		order: [['id', 'DESC']],
		distinct: true, // to fix count
		col: 'id', // to fix count
	});

	return {
		total: orders.count,
		records: orders.rows,
		limit: limit,
		page: page,
	};
}

async function updateOrderId(req) {
	const { orderId } = req.params;

	const updatedOrder = await db.order.update(
		{
			...req.body,
		},
		{
			where: {
				id: orderId,
			},
		}
	);
	if (!updatedOrder[0])
		throw new ApiError(httpStatus.NOT_FOUND, `Order not found`);
	return { success: true };
}

async function updateOrderStatus(req) {
	const { orderId } = req.params;
	const { status: newStatus } = req.body;

	const transaction = await db.sequelize.transaction();

	try {
		const order = await db.order.findByPk(orderId, {
			transaction,
			lock: transaction.LOCK.UPDATE,
		});

		if (!order) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
		}
		// 2️⃣ Fetch user separately (no lock needed)
		let user = null;
		if (order.app_user_id) {
			order.app_user = await db.app_user.findByPk(order.app_user_id, {
				transaction,
			});
		}
		order.order_item = await db.order_item.findAll({
			where: { order_id: orderId },
			transaction,
		});

		const oldStatus = order.status;

		// 2️⃣ Deduct stock ONLY when pending → in_progress
		if (oldStatus === 'pending' && newStatus === 'in_progress') {
			let quantity = 0;
			const orderItems = await db.order_item.findAll({
				where: { order_id: orderId },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			// group quantities by variant
			const variantQtyMap = {};

			let productDetails = '';
			// return;

			for (const item of orderItems) {
				if (!item.product_variant_id) {
					// continue;
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Variant missing for order item ${item.id}`
					);
				}

				variantQtyMap[item.product_variant_id] =
					(variantQtyMap[item.product_variant_id] || 0) +
					item.quantity;
				productDetails += `${item.product_title} (SKU: ${item.sku}) ${item.quantity} pcs  \n`;
			}

			const variantIds = Object.keys(variantQtyMap);

			// get stock rows with lock
			const stockRows = await db.product_variant_to_branch.findAll({
				where: {
					product_variant_id: {
						[Op.in]: variantIds,
					},
				},
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			for (const stockRow of stockRows) {
				const requiredQty = variantQtyMap[stockRow.product_variant_id];

				// check stock availability
				if (stockRow.stock < requiredQty) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Insufficient stock for variant ${stockRow.product_variant_id}`
					);
				}

				// deduct stock
				stockRow.stock -= requiredQty;
				quantity += requiredQty;

				await stockRow.save({ transaction });
			}
			const courier_details = JSON.parse(order.courier_details);
			if (
				!courier_details ||
				!courier_details.city ||
				!courier_details.service ||
				!courier_details.weight
			) {
				throw new ApiError(
					httpStatus.BAD_REQUEST,
					'Complete shipping details are required to process order'
				);
			}
			const booking = await createCCLBooking({
				name: order.app_user_id
					? order.app_user?.name
					: order.guest_first_name || 'No Name',
				email:
					(order.app_user_id && order.app_user?.email) ||
					order.guest_email ||
					null,
				phone:
					(order.app_user_id && order.app_user?.phone) ||
					order.guest_phone ||
					null,
				address: order.shipping_address,
				instructions: req.body.instructions || null,
				productDetails: productDetails,
				quantity,
				total: order.total,
				payment_method: order.payment_method,
				tracking_id: order.tracking_id,
				cityId: courier_details.city,
				weight: courier_details.weight,
				shipmentService: courier_details.service,
			});
			order.courier_details = JSON.stringify({
				...courier_details,
				bookingId: booking.id,
				trackingId: booking.tracking_number,
			});
			await sendInprocessEmailToUser(order, booking.tracking_number);
		}

		// 3️⃣ Update order status
		order.status = newStatus;

		await order.save({ transaction });

		await transaction.commit();

		return {
			success: true,
			message: `Order status updated from ${oldStatus} → ${newStatus}`,
		};
	} catch (error) {
		await transaction.rollback();
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || 'Failed to update order status'
		);
	}
}

// run this function only when status change from pending to inprocess
// third-party api to create booking
async function createCCLBooking(data) {
	const {
		name,
		email,
		phone,
		address,
		instructions,
		productDetails,
		quantity,
		total,
		payment_method,
		tracking_id,
		cityId,
		weight,
		shipmentService,
	} = data;

	try {
		const booking = await axios.post('https://oyeah.pk/bookingapi', {
			clients: config.cclCourier.clients, //Client ID to be Provided by Admin - MANDATORY
			token: config.cclCourier.apiKey,
			name, //Customer Name - MANDATORY
			email, //Customer Email if any
			mobile: phone || '03111111111', //Customer Mobile Number - MANDATORY
			city: cityId, //City ID - MANDATORY -- API
			address, //Customer Address - MANDATORY
			instructions, //Order Instructions if Any
			details: productDetails, //Product Details
			qty: quantity, //Product Quantity eg. 1 or 2 or 3 - MANDATORY
			weight, //Shipment Weight eg. 0.5 or 1 or 2 - MANDATORY
			total, //COD Amount - MANDATORY
			open_allow: '1', //Open Allowed Valuies 1 & 0 - Optional
			shipment_services: shipmentService, //1 for TCS, 21 for TRAX, 3 for LEO, 17 for POSTEX, RIDER, CALL
			client_order_id: tracking_id, //Your Internal Order ID,
			shopify_order_id: '', //Shopify Order ID: [gid://shopify/Order/1234567890]
			client_store_id: 1049, //Client Store ID: [Eg: 12345| Find in Stores Section in Portal] - Optional
		});

		return booking.data.data;
	} catch (error) {
		let message = 'Error creating CCL booking';
		if (error.response) {
			const apiMessage = error.response.data?.message;
			const apiErrors = error.response.data?.errors;

			message = apiMessage;

			if (Array.isArray(apiErrors) && apiErrors.length > 0) {
				message += `: ${apiErrors.join(', ')}`;
			}
		} else {
			message = error.message;
		}

		throw new ApiError(
			httpStatus[error?.response?.status || 500],
			message?.length > 0
				? message
				: 'The courier API is currently experiencing issues. Please check with the courier service provider'
		);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || 'error creating CCL booking'
		);
	}
}

async function sendInprocessEmailToUser(order, courierTrackingId) {
	const { app_user_id, guest_email, order_item } = order;

	const email = app_user_id ? order.app_user?.email : guest_email || null;

	await sendEmail({
		// to: 'annasahmed1609@gmail.com',
		to: email,
		subject: `Order #${order.tracking_id} is in Process`,
		html: orderInProcessCustomerTemplate({
			orderId: order.tracking_id,
			customerName: order.app_user_id
				? order.app_user?.name
				: `${order.guest_first_name || ''} ${
						order.guest_last_name || ''
				  }`.trim() || 'Customer',
			items: order_item.map((item) => ({
				title: item.product_title,
				sku: item.sku,
				quantity: item.quantity,
				finalPrice: item.price,
			})),
			subtotal: order.order_amount,
			shipping: order.shipping,
			total: order.total,
			tracking_id: courierTrackingId,
		}),
		attachments: [],
	});

	return true;
}

async function exportOrders(req, res) {
	const { status, startDate, endDate, search, paymentMethod, sku } =
		req.query;

	const whereCondition = {};
	if (status) whereCondition.status = status;
	if (paymentMethod) whereCondition.payment_method = paymentMethod;

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
	if (search) {
		whereCondition[Op.or] = [
			{ tracking_id: { [Op.iLike]: `%${search}%` } },
			{ guest_first_name: { [Op.iLike]: `%${search}%` } },
			{ '$user.name$': { [Op.iLike]: `%${search}%` } },
		];
	}

	/**
	 * 🔎 SKU FILTER — use subquery to avoid broken JOIN in findAll with user association
	 */
	if (sku) {
		const matchingItems = await db.order_item.findAll({
			attributes: ['order_id'],
			where: { sku: { [Op.iLike]: `%${sku}%` } },
			raw: true,
		});
		const matchingOrderIds = matchingItems.map((item) => item.order_id);
		whereCondition.id = {
			[Op.in]: matchingOrderIds.length ? matchingOrderIds : [-1],
		};
	}

	const orders = await db.order.findAll({
		where: whereCondition,
		include: [{ model: db.app_user, as: 'user', required: false }],
		order: [['id', 'ASC']],
	});

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Orders');

	sheet.columns = [
		{ header: 'ID', key: 'id', width: 10 },
		{ header: 'Tracking ID', key: 'tracking_id', width: 30 },
		{ header: 'Date', key: 'created_at', width: 20 },
		{ header: 'Customer Name', key: 'customer_name', width: 25 },
		{ header: 'Email', key: 'email', width: 30 },
		{ header: 'Phone', key: 'phone', width: 20 },
		{ header: 'Shipping Address', key: 'shipping_address', width: 40 },
		{ header: 'City', key: 'shipping_city', width: 15 },
		{ header: 'Payment Method', key: 'payment_method', width: 18 },
		{ header: 'Order Amount', key: 'order_amount', width: 15 },
		{ header: 'Shipping', key: 'shipping', width: 12 },
		{ header: 'Total', key: 'total', width: 15 },
		{ header: 'Status', key: 'status', width: 18 },
		{
			header: 'Courier Tracking ID',
			key: 'courier_tracking_id',
			width: 25,
		},
	];

	// Style header row
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

	orders.forEach((order) => {
		const o = order.get({ plain: true });
		sheet.addRow({
			id: o.id,
			tracking_id: o.tracking_id,
			created_at: new Date(o.created_at).toLocaleDateString(),
			customer_name:
				o.user?.name ||
				`${o.guest_first_name || ''} ${o.guest_last_name || ''}`.trim(),
			email: o.user?.email || o.guest_email || '',
			phone: o.user?.phone || o.guest_phone || '',
			shipping_address: o.shipping_address,
			shipping_city: o.shipping_city,
			payment_method: o.payment_method,
			order_amount: o.order_amount,
			shipping: o.shipping,
			total: o.total,
			status: o.status,
			courier_tracking_id: o.courier_tracking_id || '',
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	res.setHeader(
		'Content-Type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	);
	res.setHeader(
		'Content-Disposition',
		`attachment; filename="orders_export_${Date.now()}.xlsx"`
	);
	return res.send(buffer);
}

module.exports = {
	getOrderById,
	getAllOrders,
	exportOrders,
	updateOrderStatus,
	updateOrderId,
};
