async function createLog({ data, req }) {
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
	} = req.body;
	const existedLog = await getLogByCriteria({ model, record_id, action });

	if (existedLog) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This log entry already exists'
		);
	}

	const createdLog = await db.log
		.create({
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
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdLog;
}
