const db = require('../db/models');
const commonUtils = require('./commonUtils');

async function createLog({ data, req, transaction }) {
	console.log('Creating log with data000:', data);
	if (req) {
		const userId = commonUtils.getUserId(req);
		if (userId) {
			data.user_id = userId;
		}
		if (req.originalUrl) {
			data.end_point = req.originalUrl;
		}
		if (req.body) {
			data.request_body = req.body;
		}
	}

	console.log('Req====', req.originalUrl, req.body);
	console.log('Creating log with data111:', data);
	const {
		model,
		record_id,
		action,
		method,
		end_point,
		status_code,
		message,
		request_body,
		old_values,
		new_values,
		changed_fields,
		user_id,
	} = data;
	const createdLog = await db.log
		.create(
			{
				model,
				record_id,
				action,
				method,
				end_point,
				status_code,
				message,
				request_body,
				old_values,
				new_values,
				changed_fields,
				user_id,
			},
			{ transaction }
		)
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdLog;
}

module.exports = {
	createLog,
};
