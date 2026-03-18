'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('order');
		if (!tableDescription['courier_details']) {
			await queryInterface.addColumn('order', 'courier_details', {
				type: Sequelize.JSONB,
				allowNull: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('order', 'courier_details');
	},
};
