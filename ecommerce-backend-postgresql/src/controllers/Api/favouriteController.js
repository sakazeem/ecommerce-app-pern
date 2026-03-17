const catchAsync = require('../../utils/catchAsync');
const { verifyToken } = require('../../utils/auth');
const { favouriteService } = require('../../services/Api');

const getFavourites = catchAsync(async (req, res) => {
	const { userId } = await verifyToken(req.cookies.accessToken);
	const favourites = await favouriteService.getFavourites(userId);
	res.send({ favourites });
});

const toggleFavourite = catchAsync(async (req, res) => {
	const { userId } = await verifyToken(req.cookies.accessToken);
	const result = await favouriteService.toggleFavourite(
		userId,
		req.body.product_id
	);
	res.send(result);
});

const syncFavourites = catchAsync(async (req, res) => {
	const { userId } = await verifyToken(req.cookies.accessToken);
	const favourites = await favouriteService.syncFavourites(
		userId,
		req.body.productIds
	);
	res.send({ favourites });
});

module.exports = { getFavourites, toggleFavourite, syncFavourites };
