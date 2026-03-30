const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
	authService,
	userService,
	// emailService,
	tokenService,
} = require('../services');

const register = catchAsync(async (req, res) => {
	const user = await userService.createUser(req);
	const tokens = await tokenService.generateAuthTokens({
		userId: user.id,
		roleId: user.role_id,
	}, false);
	delete user.password;
	res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
	const user = await authService.loginUserWithEmailAndPassword(req);
	const tokens = await tokenService.generateAuthTokens({
		userId: user.id,
		roleId: user.role_id,
	});
	res.send({ user, tokens });
});

module.exports = {
	register,
	login,
};
