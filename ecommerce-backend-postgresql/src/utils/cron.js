const cron = require('node-cron');
const db = require('../db/models');
const { Op } = require('sequelize');

const deleteExpiredTokens = cron.schedule('0 0 * * *', async () => {
	// This will run every hour, deleting tokens older than the current time
	await db.token.destroy({
		where: {
			[Op.or]: [
				{ expires_at: { [Sequelize.Op.lt]: new Date() } }, // Tokens that have expired
				// { revoked: true }
			]
		},
	});
});


const executeCronJobs = () => {
	deleteExpiredTokens.start()
}
module.exports = executeCronJobs
