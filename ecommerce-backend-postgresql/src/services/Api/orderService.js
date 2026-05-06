const httpStatus = require('http-status');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const {
	orderConfirmationAdminTemplate,
} = require('../../config/emailTemplates/orderConfirmationAdmin');
const {
	orderConfirmationCustomerTemplate,
} = require('../../config/emailTemplates/orderConfirmationUser');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const { sendEmail } = require('../email.service');
const { addOrUpdateAddress } = require('./appUserService');
const { notificationService } = require('../Admin');
const config = require('../../config/config');
const { imageService } = require('../index.js');
const { default: axios } = require('axios');

// R2 client — used to fetch receipt buffer after multer-s3 upload (no local file path exists)
const r2 = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
});

async function fetchReceiptBufferFromR2(key) {
	const { Body, ContentType } = await r2.send(
		new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
	);
	const chunks = [];
	for await (const chunk of Body) chunks.push(chunk);
	return { buffer: Buffer.concat(chunks), contentType: ContentType };
}

async function confirmOrder(req) {
	const { customer, billingAddress, items, summary, userId } = req.body;

	const receiptFile = req.file || null;

	const data = {
		shipping_address: customer.address,
		shipping_city: customer.city,
		shipping_country: customer.country,
		shipping_postal_code: customer.postalCode,
		shipping_apartment: customer.apartment || null,

		billing_address: customer.billingSameAsShipping
			? customer.address
			: billingAddress?.address,
		billing_apartment: customer.billingSameAsShipping
			? customer.apartment
			: billingAddress?.apartment || customer.apartment || null,
		billing_city: customer.billingSameAsShipping
			? customer.city
			: billingAddress?.city || customer.city,
		billing_country: customer.billingSameAsShipping
			? customer.country
			: billingAddress?.country || customer.country,
		billing_postal_code: customer.billingSameAsShipping
			? customer.postalCode
			: billingAddress?.postalCode || customer.postalCode,

		payment_method: customer.paymentMethod,

		order_amount: summary.subtotal,
		shipping: summary.shipping,
		total: summary.total,
	};

	if (userId) {
		data.app_user_id = userId;
		await db.app_user.update(
			{
				name: customer.name,
				phone: customer.phone,
			},
			{
				where: {
					id: userId,
				},
			}
		);
		await addOrUpdateAddress(
			{
				address: customer.address,
				apartment: customer.apartment || null,
				city: customer.city,
				country: customer.country,
				postal_code: customer.postalCode,
				type: 'shipping',
			},
			userId
		);
		if (!customer.billingSameAsShipping) {
			await addOrUpdateAddress(
				{
					address: billingAddress.address,
					apartment: billingAddress.apartment || null,
					city: billingAddress.city,
					country: billingAddress.country,
					postal_code: billingAddress.postalCode,
					type: 'billing',
				},
				userId
			);
		}
	} else {
		data.guest_first_name = customer.name;
		data.guest_email = customer.email;
		data.guest_phone = customer.phone;
	}

	const transaction = await db.sequelize.transaction();

	try {
		// Check global purchase limit per order
		const globalSetting = await db.setting.findOne({
			where: { name: 'globalSetting' },
		});
		const maxQtyPerOrder = globalSetting?.setting?.max_qty_per_order;
		if (maxQtyPerOrder && maxQtyPerOrder > 0) {
			const totalQty = items.reduce(
				(sum, item) => sum + item.quantity,
				0
			);
			if (totalQty > maxQtyPerOrder) {
				throw new ApiError(
					httpStatus.BAD_REQUEST,
					`Order exceeds the maximum allowed quantity of ${maxQtyPerOrder} items per order`
				);
			}
		}

		const createdOrder = await db.order.create(data, {
			transaction,
		});

		// Step 2: Generate unique tracking ID
		const trackingId = 'ORD-' + Date.now() + '-' + createdOrder.id;

		// Step 3: Update order with tracking_id
		createdOrder.tracking_id = trackingId;
		await createdOrder.save({ transaction });

		const orderItemsData = items.map((item) => ({
			order_id: createdOrder.id,
			product_id: item.id,
			product_title: item.title,
			price: item.finalPrice,
			quantity: item.quantity,
			product_variant_id: item.selectedVariant
				? item.selectedVariant.id
				: null,
			sku: item.selectedVariant ? item.selectedVariant.sku : item.sku,
		}));

		await db.order_item.bulkCreate(orderItemsData, {
			transaction,
		});

		for (const item of items) {
			if (item.selectedVariant?.id) {
				const variantBranch =
					await db.product_variant_to_branch.findOne({
						where: { product_variant_id: item.selectedVariant.id },
						transaction,
						lock: transaction.LOCK.UPDATE,
					});

				if (!variantBranch) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Variant not found for product ${item.title}`
					);
				}

				if (variantBranch.stock < item.quantity) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Insufficient stock for ${item.title}`
					);
				}

				const newVariantStock = variantBranch.stock - item.quantity;
				await variantBranch.update(
					{ stock: newVariantStock },
					{ transaction }
				);
				if (newVariantStock <= variantBranch.low_stock) {
					notificationService
						.addNotification({
							message: `Low stock alert: "${item.title}" has only ${newVariantStock} units left.`,
							image: item.thumbnail || null,
							productId: item.id,
						})
						.catch(() => {});
				}
			} else {
				const product = await db.product.findOne({
					where: { id: item.id },
					transaction,
					lock: transaction.LOCK.UPDATE,
				});

				if (!product) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Product not found: ${item.title}`
					);
				}

				if (product.stock < item.quantity) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						`Insufficient stock for ${item.title}`
					);
				}

				const newProductStock = product.stock - item.quantity;
				await product.update(
					{
						stock: newProductStock,
					},
					{ transaction }
				);
				if (newProductStock <= (product.low_stock ?? 10)) {
					notificationService
						.addNotification({
							message: `Low stock alert: "${item.title}" has only ${newProductStock} units left.`,
							image: item.thumbnail || null,
							productId: item.id,
						})
						.catch(() => {});
				}
			}
		}

		const orderId = createdOrder.tracking_id;

		let receiptUrl = null;
		const receiptAttachment = [];

		if (receiptFile) {
			try {
				const result = await imageService.mediaUpload(receiptFile);
				receiptUrl = result.url;

				const { buffer, contentType } = await fetchReceiptBufferFromR2(
					receiptUrl
				);
				receiptAttachment.push({
					filename: receiptFile.originalname,
					content: buffer,
					contentType: contentType || receiptFile.mimetype,
				});
			} catch (e) {
				console.error('Receipt upload/fetch failed:', e.message);
				throw new ApiError(
					httpStatus.BAD_REQUEST,
					'Receipt upload failed: ' + e.message
				);
			}
		}

		if (receiptUrl) {
			createdOrder.payment_receipt_url = receiptUrl;
			await createdOrder.save({ transaction });
		}
		await transaction.commit();
		setImmediate(async () => {
			try {
				if (customer.email) {
					await sendEmail({
						// to: 'annasahmed1609@gmail.com',
						to: customer.email,
						subject: `Order Confirmation #${orderId}`,
						html: orderConfirmationCustomerTemplate({
							orderId,
							customerName: `${customer.name}`,
							items,
							subtotal: summary.subtotal,
							shipping: summary.shipping,
							total: summary.total,
						}),
						attachments: [],
					});
				}

				await sendEmail({
					// to: 'annasahmed1609@gmail.com',
					// to: 'salmanazeemkhan@gmail.com',
					// to: 'orders@babiesnbaba.com',
					// to: 'devsts26@gmail.com',
					to:
						config.env === 'development'
							? 'annasahmed1609@gmail.com'
							: 'babiesnbaba@gmail.com',
					subject: `New Order #${orderId}`,
					html: orderConfirmationAdminTemplate({
						orderId,
						customer,
						billingAddress,
						items,
						total: summary.total?.toFixed(1),
						shipping: summary.shipping,
						paymentMethod: customer.paymentMethod,
					}),
					attachments: receiptAttachment,
				});
			} catch (e) {
				console.error('Email failed:', e.message);
			}
		});

		// await transaction.commit();

		// if (receiptFile?.path) {
		// 	fs.unlink(receiptFile.path, () => {});
		// }

		return createdOrder;
	} catch (error) {
		await transaction.rollback();

		// if (receiptFile?.path) {
		// 	fs.unlink(receiptFile.path, () => {});
		// }

		console.log(error.message || error);

		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || 'Order confirmation failed'
		);
	}
}

async function trackOrderByTrackingId(req) {
	const { trackingId } = req.params;
	const rawOrder = await db.order.findOne({
		where: {
			tracking_id: trackingId,
		},
		include: [
			{
				model: db.order_item,
				required: false,
			},
		],
	});
	if (!rawOrder) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			'Order not found with this tracking ID'
		);
	}
	const order = rawOrder.get({ plain: true });
	if (order && order.courier_details) {
		const courier_details = JSON.parse(order.courier_details);
		if (courier_details.bookingId && courier_details.trackingId) {
			try {
				const booking = await axios.post(
					'https://oyeah.pk/trackingapi',
					{
						clients: config.cclCourier.clients, //Client ID to be Provided by Admin - MANDATORY
						token: config.cclCourier.apiKey,
						// id: '770162614', //Order ID - MANDATORY
						// shipped_ref: 'KI7529011510', //Tracking ID - MANDATORY
						id: courier_details.bookingId, //Order ID - MANDATORY
						shipped_ref: courier_details.trackingId, //Tracking ID - MANDATORY
					}
				);
				order.trackingStatus = booking.data;
				order.couriertrackingId = courier_details.trackingId;
			} catch (e) {
				console.log('CCL Booking API Error:', e.message);
			}
		}
	}

	return order;
}
async function trackOrderByTrackingIdOld(req) {
	const { trackingId } = req.params;
	const order = await db.order.findOne({
		where: {
			tracking_id: trackingId,
		},
		include: [
			{
				model: db.order_item,
				required: false,
			},
		],
	});

	if (!order) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			'Order not found with this tracking ID'
		);
	}

	return order;
}

async function myOrders(req, userId) {
	if (!userId) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	return await db.order.findAll({
		where: {
			app_user_id: userId,
		},
		include: [
			{
				model: db.order_item,
				required: false,
				include: [
					{
						model: db.product,
						include: [
							{
								model: db.media,
								required: false,
								as: 'images',
								attributes: ['url', 'title'],
							},
							{
								model: db.media,
								required: false,
								as: 'thumbnailImage',
								attributes: ['url', 'title'],
							},
						],
					},
				],
			},
		],
	});
}
async function getOrderByTrackingId(req, userId) {
	if (!userId) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	return await db.order.findOne({
		where: {
			app_user_id: userId,
			tracking_id: req.params.trackingId,
		},
		include: [
			{
				model: db.order_item,
				required: false,
				include: [
					{
						model: db.product,
						include: [
							{
								model: db.media,
								required: false,
								as: 'images',
								attributes: ['url', 'title'],
							},
							{
								model: db.media,
								required: false,
								as: 'thumbnailImage',
								attributes: ['url', 'title'],
							},
						],
					},
				],
			},
		],
	});
}

module.exports = {
	confirmOrder,
	trackOrderByTrackingId,
	myOrders,
	getOrderByTrackingId,
};

// confirmOrderPayload
const confirmOrderPayload = {
	customer: {
		email: 'annasahmed1609@gmail.com',
		firstName: 'Annas',
		lastName: 'Ahmed',
		address: 'Bahadurabad, Karachi, Pakistan',
		city: 'Karachi',
		postalCode: '07482',
		country: 'Pakistan',
		phone: '03326556262',
		paymentMethod: 'cod',
		billingSameAsShipping: false,
	},
	billingAddress: {
		country: 'Pakistan',
		firstName: 'Annas',
		lastName: 'Ahmed',
		address: 'Bahadurabad, Karachi, Pakistan',
		city: 'Karachi',
		postalCode: '07482',
		phone: '03326556262',
	},
	items: [
		{
			id: 389,
			title: 'BABY U SHAPE NECK PILLOW FOX ORANGE',
			slug: 'baby-u-shape-neck-pillow-fox-orange',
			thumbnail: '/uploads/baby-u-shape-neck-pillow-fox-orange (1).jpg',
			base_price: 748,
			base_discount_percentage: 20,
			quantity: 4,
			selectedVariant: {
				id: 201,
				sku: 'SKU-1',
				image: null,
				attributes: [],
			},
			unitPrice: 598.4,
			finalPrice: 2393.6,
		},
		{
			id: 307,
			title: 'TU BABY 2PCS PLASTIC APPRIN BIB',
			slug: 'tu-baby-2pcs-plastic-apprin-bib',
			thumbnail: '/uploads/tu-baby-2pcs-plastic-apprin-bib (1).jpg',
			base_price: 415,
			base_discount_percentage: 20,
			quantity: 1,
			selectedVariant: {
				id: 120,
				sku: 'SKU-1',
				image: null,
				attributes: [
					{
						id: 9,
						name: 'gender',
						value: 'Unisex',
					},
				],
			},
			unitPrice: 332,
			finalPrice: 332,
		},
		{
			id: 306,
			title: 'NUS SLEEVE BIB CHINA PRINTED',
			slug: 'nus-sleeve-bib-china-printed',
			thumbnail: '/uploads/nus-sleeve-bib-china-printed (1).jpg',
			base_price: 325,
			base_discount_percentage: 20,
			quantity: 1,
			selectedVariant: {
				id: 119,
				sku: 'SKU-1',
				image: null,
				attributes: [
					{
						id: 9,
						name: 'gender',
						value: 'Unisex',
					},
				],
			},
			unitPrice: 260,
			finalPrice: 260,
		},
	],
	summary: {
		subtotal: 2985.6,
		shipping: 150,
		total: 3135.6,
	},
};
