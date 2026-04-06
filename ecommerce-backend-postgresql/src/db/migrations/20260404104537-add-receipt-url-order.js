'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('order', 'payment_receipt_url', {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('order', 'payment_receipt_url');
	},
};
