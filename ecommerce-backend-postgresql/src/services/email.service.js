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
		.catch((err) => logger.warn(err.message));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} [text]
 * @param {string} [html]
 * @param {Array}  [attachments] - Nodemailer attachments array e.g. [{ filename, path }]
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
	await transport.sendMail({
		from,
		to: config.env === 'development' ? 'annasahmed1609@gmail.com' : to,
		bcc: config.env === 'development' ? [] : ['annasahmed1609@gmail.com'],
		// : ['salmanazeemkhan@gmail.com', 'annasahmed1609@gmail.com'],
		subject,
		text,
		html,
		attachments,
	});
};

module.exports = {
	transport,
	sendEmail,
};
