const catchAsync = require('../../utils/catchAsync');
const { adminOrderService } = require('../../services/Admin');

const updateReview = catchAsync(async (req, res) => {
	const result = await adminOrderService.updateReview(req);
	res.send(result);
});

module.exports = { updateReview };
