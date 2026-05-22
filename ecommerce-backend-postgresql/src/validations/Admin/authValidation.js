const Joi = require('@hapi/joi');

const sendOtp = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		password: Joi.string().optional(), // sent by CMS form but not used here
	}),
};

const login = {
	body: Joi.object().keys({
		email: Joi.string().required(),
		password: Joi.string().required(),
		otp: Joi.string().length(6).required(),
	}),
};

module.exports = {
	sendOtp,
	login,
};
