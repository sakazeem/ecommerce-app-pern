'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('notification', 'order_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
		await queryInterface.addColumn('notification', 'product_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('notification', 'order_id');
		await queryInterface.removeColumn('notification', 'product_id');
	},
};
