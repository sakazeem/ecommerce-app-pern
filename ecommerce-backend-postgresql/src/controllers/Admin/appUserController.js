const catchAsync = require('../../utils/catchAsync');
const { adminAppUserService } = require('../../services/Admin');

const getAppUsers = catchAsync(async (req, res) => {
	const appUsers = await adminAppUserService.getAppUsers(req);
	res.send(appUsers);
});

const updateAppUser = catchAsync(async (req, res) => {
	const appUsers = await adminAppUserService.updateAppUser(req);
	res.send(appUsers);
});

module.exports = {
	getAppUsers,
	updateAppUser,
};
