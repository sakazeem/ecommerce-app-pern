const Joi = require('@hapi/joi');
const { password } = require('../customValidation');

const login = {
	body: Joi.object().keys({
		email: Joi.string().required(),
		password: Joi.string().required(),
	}),
};
const register = {
	body: Joi.object().keys({
		email: Joi.string().required(),
		password: Joi.string().required(),
		name: Joi.string().required(),
		user_type: Joi.string().valid('website', 'mobile').required().messages({
			'any.only': "User type must be either 'website' or 'mobile'",
			'string.empty': 'User type is required',
		}),

		// phone: Joi.string().allow(null).optional().custom(validatePhoneNumber),
	}),
};
const sendOtp = {
	body: Joi.object().keys({
		email: Joi.string().required(),
		name: Joi.string().required(),
	}),
};
const logout = {
	body: Joi.object().keys({}),
};
const refresh = {
	body: Joi.object().keys({}),
};
const forgotPassword = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
	}),
};
const resetPassword = {
	query: Joi.object().keys({
		token: Joi.string().required(),
	}),
	body: Joi.object().keys({
		password: Joi.string().required().custom(password),
	}),
};

module.exports = {
	login,
	register,
	logout,
	refresh,
	sendOtp,
	forgotPassword,
	resetPassword,
};
