const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');

async function getReviewsByUser(req, userId) {
	if (!userId) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	return await db.review.findAll({
		where: {
			app_user_id: userId,
		},
		include: [
			{
				model: db.product,
				required: false,
				include: [
					{
						model: db.media,
						required: false,
						as: 'thumbnailImage',
						attributes: ['url', 'title'],
					},
				],
			},
		],
	});
}

async function createReview(req, userId) {
	const { reviews, name } = req.body;
	// const { product_id, order_item_id, rating, title, comment, name } =
	// 	req.body;

	const transaction = await db.sequelize.transaction();

	try {
		const productIds = new Set();
		for (const r of reviews) {
			const { product_id, order_item_id, rating, title, comment } = r;
			const existingReview = userId
				? await db.review.findOne({
						where: {
							product_id,
							app_user_id: userId,
						},
						transaction,
				  })
				: null;
			let review;
			if (existingReview) {
				// 2. Update review instead of creating new
				review = await existingReview.update(
					{ rating, title, comment },
					{ transaction }
				);
			} else {
				review = await db.review.create(
					{
						product_id,
						order_item_id,
						rating,
						title,
						comment,
						app_user_id: userId || null,
						guest_name: name,
					},
					{ transaction }
				);
			}
		}

		for (const product_id of productIds) {
			const stats = await db.review.findOne({
				attributes: [
					[
						sequelize.fn('AVG', sequelize.col('rating')),
						'avg_rating',
					],
					[
						sequelize.fn('COUNT', sequelize.col('id')),
						'total_reviews',
					],
				],
				where: {
					product_id,
					// status: 'APPROVED',
				},
				transaction,
				raw: true,
			});

			await db.product.update(
				{
					avg_rating: Number(stats.avg_rating || 0).toFixed(1),
					total_reviews: stats.total_reviews,
				},
				{ where: { id: product_id }, transaction }
			);
		}
		await transaction.commit();
		return true;
	} catch (error) {
		await transaction.rollback();
		// throw new ApiError("");
		console.error('error creating review', error.message || error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || 'Error creating review'
		);
	}
}

module.exports = {
	getReviewsByUser,
	createReview,
};
