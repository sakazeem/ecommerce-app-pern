const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const { host, port, auth, from } = config.brevoEmail;

const transport = nodemailer.createTransport({
	host,
	port: Number(port),
	secure: false,
	auth,
});

if (config.env !== 'test') {
	transport
		.verify()
		.then(() => logger.info('Connected to email server'))
		.catch((err) =>
			logger.warn(
				// 'Unable to connect to email server. Make sure you have configured the SMTP options in .env',
				err.message
			)
		);
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, text, html }) => {
	await transport.sendMail({
		from,
		to: config.env === 'development' ? 'annasahmed1609@gmail.com' : to,
		bcc:
			config.env === 'development'
				? []
				: ['salmanazeemkhan@gmail.com', 'annasahmed1609@gmail.com'],
		subject,
		text,
		html,
	});
};

module.exports = {
	transport,
	sendEmail,
};
