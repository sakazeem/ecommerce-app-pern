const db = require('../../db/models/index.js');
const commonUtils = require('../../utils/commonUtils.js');
const createBaseService = require('../../utils/baseService.js');
const { imageService, cloudinaryService } = require('../index.js');
const ApiError = require('../../utils/ApiError.js');
const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { getOffset } = require('../../utils/query.js');
const config = require('../../config/config.js');

const mediaService = createBaseService(db.media, {
	name: 'Media',
	checkDuplicateSlug: false,
	formatCreateData: (data) => ({
		url: data.url,
		title: data.title,
		size: data.size,
		...(data.media_type && { media_type: data.media_type }),
	}),
});

// Using userId logic from request
async function createMedia(req) {
	const media = await imageService.mediaUpload(req.file);
	const userId = commonUtils.getUserId(req);
	const isVideo = req.file.mimetype.startsWith('video/');
	return mediaService.create(
		{
			url: media.url,
			title: media.title,
			size: media.size,
			media_type: isVideo ? 'video' : 'image',
		},
		userId
	);
}

async function softDeleteMediaById(req) {
	const userId = commonUtils.getUserId(req);
	return mediaService.softDelete(req.params.mediaId, userId);
}
async function softBulkDeleteMediaById(req) {
	const { startId, endId } = req.query;
	const deletedByUserId = commonUtils.getUserId(req);

	if (!startId || !endId) {
		throw new Error('startId and endId are required');
	}

	const [count] = await db.media.update(
		{
			deleted_at: new Date(),
			deleted_by: deletedByUserId,
		},
		{
			where: {
				id: {
					[Op.between]: [Number(startId), Number(endId)],
				},
			},
		}
	);

	return {
		success: true,
		affectedRows: count,
	};
}
async function permanentDeleteMediaById(req) {
	const userId = commonUtils.getUserId(req);
	const media = await db.media
		.scope('withDeleted')
		.findByPk(req.params.mediaId);
	if (!media) {
		throw new ApiError(httpStatus.NOT_FOUND, 'media not found');
	}
	const publicIdWithoutExt = media.url.replace(/\.[^/.]+$/, '');
	await cloudinaryService.deleteMedia(publicIdWithoutExt);
	return mediaService.permanentDelete(req.params.mediaId, userId);
}

function extractSlugFromFilename(filename) {
	const name = filename
		.replace(/\.[^/.]+$/, '') // remove extension
		.replace(/\(\d+\)/g, '') // remove (1), (2)
		.replace(/-\d+$/, '') // remove -1, -2
		.trim();

	return name;
}
async function bulkUploadMedia(req) {
	const userId = commonUtils.getUserId(req);
	const files = req.files;
	const results = [];

	for (const file of files) {
		const isVideo = file.mimetype.startsWith('video/');
		// 1️⃣ Prepare media
		const mediaData = await imageService.mediaUpload(file);

		// 2️⃣ Upsert media
		let media = await db.media.findOne({
			where: {
				[Op.or]: [{ title: mediaData.title }, { url: mediaData.url }],
			},
		});

		if (media) {
			media = await media.update({
				url: mediaData.url,
				title: mediaData.title,
				size: mediaData.size,
			});
		} else {
			media = await mediaService.create(
				{
					url: mediaData.url,
					title: mediaData.title,
					size: mediaData.size,
					media_type: isVideo ? 'video' : 'image',
				},
				userId
			);
		}

		// 3️⃣ Extract product slug
		const productSlug = extractSlugFromFilename(file.originalname);

		let productTranslation = null;

		// 4️⃣ Find product via translation
		productTranslation = await db.product_translation.findOne({
			where: {
				slug: {
					[Op.iLike]: `${productSlug}`,
				},
			},
			include: [
				{
					model: db.product,
					attributes: ['id', 'thumbnail'],
				},
			],
		});

		// 2️⃣ Fallback: prefix match ONLY if exact not found
		if (!productTranslation) {
			const matches = await db.product_translation.findAll({
				where: {
					slug: {
						[Op.iLike]: `${productSlug}%`,
					},
				},
				include: [
					{
						model: db.product,
						attributes: ['id', 'thumbnail'],
					},
				],
				order: [['slug', 'ASC']],
			});
			if (matches.length === 1) {
				productTranslation = matches[0];
			}
		}

		if (!productTranslation || !productTranslation.product) {
			results.push({
				file: file.originalname,
				status: 'uploaded_only',
				reason: 'product_not_found',
				slug: productSlug,
			});
			continue;
		}

		const product = productTranslation.product;

		// 6️⃣ Set thumbnail only if empty
		let isThumbnail = false;
		if (!product.thumbnail) {
			await product.update({
				thumbnail: media.id,
				status: true,
			});
			isThumbnail = true;
		} else {
			await db.product_to_media.findOrCreate({
				where: {
					product_id: product.id,
					media_id: media.id,
				},
			});
		}

		results.push({
			file: file.originalname,
			status: 'attached',
			product: productTranslation.slug,
			mediaId: media.id,
			isThumbnail,
		});
	}

	return results;
}

async function deleteAllProductsMedia(req) {
	const deletedByUserId = commonUtils.getUserId(req);

	// get product thumbnails
	const products = await db.product.findAll({
		where: {
			thumbnail: { [Op.ne]: null },
		},
		attributes: ['thumbnail'],
		raw: true,
	});

	const thumbnailIds = products.map((v) => v.thumbnail);

	// get product media
	const productMedia = await db.product_to_media.findAll({
		attributes: ['media_id'],
		raw: true,
	});

	const productMediaIds = productMedia.map((v) => v.media_id);

	// merge & dedupe ids
	const mediaIds = [...new Set([...thumbnailIds, ...productMediaIds])];

	if (!mediaIds.length) {
		return 0;
	}

	await db.product.update(
		{
			thumbnail: null,
		},
		{
			where: {
				thumbnail: { [Op.ne]: null },
			},
		}
	);

	const [count] = await db.media.update(
		{
			deleted_at: new Date(),
			deleted_by: deletedByUserId,
		},
		{
			where: {
				id: {
					[Op.in]: mediaIds,
				},
				deleted_at: null, // avoid re-updating already deleted
			},
		}
	);

	return count;
}

const getMedias = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		id,
		media_type,
		search,
	} = req.query;

	const offset = getOffset(page, limit);
	const finalSort = [['id', 'DESC']];

	// Normalize ids (can be single or multiple)
	let whereCondition = {};

	if (id) {
		const idsArray = Array.isArray(id) ? id : [id];
		whereCondition.id = { [Op.in]: idsArray };
	}

	if (media_type) {
		whereCondition.media_type = media_type;
	}

	if (search) {
		whereCondition.title = { [Op.iLike]: `%${search}%` };
	}

	const data = await db.media.findAndCountAll({
		where: { ...whereCondition, deleted_at: null },
		offset,
		limit,
		order: finalSort,
		distinct: true,
		col: 'id',
	});

	return {
		total: data.count,
		records: data.rows,
		limit,
		page,
	};
};

const slugify = require('slugify');

function cleanFileName(name) {
	const ext = name.split('.').pop();
	const base = name.replace(/\.[^/.]+$/, '');

	const clean = slugify(base, {
		lower: true,
		strict: true, // removes special chars
	});

	return `${clean}.${ext}`;
}

async function processImage(file) {
	const isImage = file.mimetype.startsWith('image/');
	const isVideo = file.mimetype.startsWith('video/');

	// 👉 Skip videos completely
	if (isVideo) {
		return {
			buffer: file.buffer,
			ext: file.originalname.split('.').pop(),
		};
	}

	if (!isImage) {
		throw new Error('Unsupported file type');
	}

	let image = sharp(file.buffer);
	const metadata = await image.metadata();

	const isSquare = metadata.width === metadata.height;

	// 👉 Resize ONLY if square and large
	if (isSquare && metadata.width > 800) {
		image = image.resize(800, 800);
	}

	// 👉 Convert to WebP + compress
	const buffer = await image
		.webp({ quality: 80 }) // 🔥 sweet spot
		.toBuffer();

	return {
		buffer,
		ext: 'webp',
	};
}
const { PutObjectCommand } = require('@aws-sdk/client-s3');
async function uploadToR2(buffer, key, mimetype) {
	await s3.send(
		new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: mimetype,
		})
	);

	return `https://${process.env.R2_BUCKET_NAME}.r2.dev/${key}`;
}

const transferAllImagesToCloudfare = () => {};

module.exports = {
	deleteAllProductsMedia,
	transferAllImagesToCloudfare,
};

module.exports = {
	createMedia,
	getMedias,
	permanentDeleteMediaById,
	softDeleteMediaById,
	softBulkDeleteMediaById,
	bulkUploadMedia,
	deleteAllProductsMedia,
};
