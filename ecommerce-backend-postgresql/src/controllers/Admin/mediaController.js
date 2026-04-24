const catchAsync = require('../../utils/catchAsync');
const { adminMediaService } = require('../../services/Admin');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');

const getMedias = catchAsync(async (req, res) => {
	const medias = await adminMediaService.getMedias(req);
	res.send(medias);
});
const createMedia = catchAsync(async (req, res) => {
	if (!req.file) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Image not found');
	}
	console.log('✅ Upload successful:', {
		url: req.file.location,
		key: req.file.key,
		size: req.file.size,
	});

	const medias = await adminMediaService.createMedia(req);
	res.send(medias);
});
const bulkUploadMedia = catchAsync(async (req, res) => {
	const files = req.files; // multer array upload
	if (!files || files.length === 0) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
	}
	const medias = await adminMediaService.bulkUploadMedia(req);
	res.send(medias);
});

const softDeleteMedia = catchAsync(async (req, res) => {
	await adminMediaService.softDeleteMediaById(req);
	res.send({ success: true });
});
const softBulkDeleteMediaById = catchAsync(async (req, res) => {
	const data = await adminMediaService.softBulkDeleteMediaById(req);
	res.send({ data, success: true });
});
const deleteAllProductsMedia = catchAsync(async (req, res) => {
	const data = await adminMediaService.deleteAllProductsMedia(req);
	res.send({ data, success: true });
});
const permanentDeleteMedia = catchAsync(async (req, res) => {
	await adminMediaService.permanentDeleteMediaById(req);
	res.send({ success: true });
});

module.exports = {
	getMedias,
	createMedia,
	softDeleteMedia,
	permanentDeleteMedia,
	bulkUploadMedia,
	softBulkDeleteMediaById,
	deleteAllProductsMedia,
};
