'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('cart');

		if (!tableDescription.sku) {
			await queryInterface.addColumn('cart', 'sku', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface) => {
		const tableDescription = await queryInterface.describeTable('cart');

		if (tableDescription.sku) {
			await queryInterface.removeColumn('cart', 'sku');
		}
	},
};
